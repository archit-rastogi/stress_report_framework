package main

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"github.com/ulikunitz/xz"
	"io"
	"os"
	"strings"
)

type CollectTask struct {
	Pattern        string
	AttachmentId   string
	ProcessedFiles int
	FilesToProcess int
	Ready          bool
	Failed         bool
	FailedReason   string
	ResultArchive  string
}

func setTaskFailAndClean(
	taskId string,
	archiveFilePath string,
	message string,
) {
	task := runningCollectTasks[taskId]
	task.Failed = true
	task.FailedReason = message
	runningCollectTasks[taskId] = task
	os.Remove(archiveFilePath)
}

func collectArchive(taskId string, pattern string, testId string) {
	task := runningCollectTasks[taskId]
	foundFiles, err := dbGetAttachmentsBatch(testId, pattern)
	if err != nil {
		task.Failed = true
		task.FailedReason = fmt.Sprintf("Failed to get files list from test %s\n%v", testId, err)
		runningCollectTasks[taskId] = task
		return
	}
	task.FilesToProcess = len(foundFiles)
	runningCollectTasks[taskId] = task
	task = runningCollectTasks[taskId]

	archiveFilePath := fmt.Sprintf("%s/%s.tar.gz", tempDir, taskId)
	createArchiveWriter, err := os.Create(archiveFilePath)
	defer createArchiveWriter.Close()
	gzipWriter, err := gzip.NewWriterLevel(createArchiveWriter, gzip.BestCompression)
	defer gzipWriter.Close()
	zipWriter := tar.NewWriter(gzipWriter)
	defer zipWriter.Close()

	for idx, file := range foundFiles {
		fileName := file[0]
		attachmentName := file[1]
		zipFileName := fmt.Sprintf("%s.xz", fileName)
		fullComprFilePath := getAbsoluteFilePath(zipFileName)

		zipFilePath := "archive/"
		clearAttachmentName := strings.ReplaceAll(attachmentName, " ", "_")
		parts := strings.Split(attachmentName, "/")
		lastPart := parts[len(parts)-1]
		if strings.Contains(fileName, lastPart) {
			zipFilePath = zipFilePath + clearAttachmentName
		} else {
			zipFilePath = zipFilePath + fmt.Sprintf("%s/%s", clearAttachmentName, fileName)
		}

		compressedFile, err := os.Open(fullComprFilePath)
		if err != nil {
			continue
		}

		xzReader, err := xz.NewReader(compressedFile)
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to unzip file %s\n%v", zipFilePath, err))
			return
		}

		info, err := compressedFile.Stat()
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to to get file state %s\n%v", zipFilePath, err))
			return
		}

		header, err := tar.FileInfoHeader(info, info.Name())
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to create header %s\n%v", zipFilePath, err))
			return
		}

		header.Name = zipFilePath

		tmpFilePath := fmt.Sprintf("%s/%s", tempDir, taskId)
		tmpFileWriter, err := os.Create(tmpFilePath)
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to create tmp file %s\n%v", zipFilePath, err))
			return
		}
		tmpFileSize, err := io.Copy(tmpFileWriter, xzReader)
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to copy tmp file data %s\n%v", zipFilePath, err))
			os.Remove(tmpFilePath)
			return
		}
		tmpFile, err := os.Open(tmpFilePath)
		if err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to flush tmp file data %s\n%v", zipFilePath, err))
			os.Remove(tmpFilePath)
			return
		}
		header.Size = tmpFileSize

		// Write file header to the tar archive
		if err = zipWriter.WriteHeader(header); err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to write hedaer in tar file %s\n%v", zipFilePath, err))
			os.Remove(tmpFilePath)
			return
		}

		if _, err = io.Copy(zipWriter, tmpFile); err != nil {
			setTaskFailAndClean(taskId, archiveFilePath, fmt.Sprintf("Failed to copy unzip file %s in archive\n%v", zipFilePath, err))
			os.Remove(tmpFilePath)
			return
		}
		os.Remove(tmpFilePath)
		task = runningCollectTasks[taskId]
		task.ProcessedFiles = idx + 1
		runningCollectTasks[taskId] = task
	}

	task.Ready = true
	task.ResultArchive = archiveFilePath
	runningCollectTasks[taskId] = task
}
