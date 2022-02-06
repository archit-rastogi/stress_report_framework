package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"github.com/ulikunitz/xz"
	"io"
	"io/ioutil"
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
	zipWriter *zip.Writer,
	archiveCreateWriter *os.File,
	taskId string,
	archiveFilePath string,
	message string,
) {
	task := runningCollectTasks[taskId]
	task.Failed = true
	task.FailedReason = message
	runningCollectTasks[taskId] = task
	zipWriter.Close()
	archiveCreateWriter.Close()
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

	archiveFilePath := fmt.Sprintf("%s/%s.tar", tempDir, taskId)
	createArchiveWriter, err := os.Create(archiveFilePath)
	zipWriter := zip.NewWriter(createArchiveWriter)

	for idx, file := range foundFiles {
		fileName := file[0]
		attachmentName := file[1]
		zipFileName := fmt.Sprintf("%s.xz", fileName)
		fillZipFilePath := getAbsoluteFilePath(zipFileName)
		readBytes, err := ioutil.ReadFile(fillZipFilePath)
		if err != nil {
			continue
		}

		zipFilePath := "archive/"
		clearAttachmentName := strings.ReplaceAll(attachmentName, " ", "_")
		if strings.Contains(attachmentName, fileName) {
			zipFilePath = zipFilePath + clearAttachmentName
		} else {
			zipFilePath = zipFilePath + fmt.Sprintf("%s/%s", clearAttachmentName, fileName)
		}
		zipFileWriter, err := zipWriter.Create(zipFilePath)
		readBuffer := bytes.NewBuffer(readBytes)
		xzReader, err := xz.NewReader(readBuffer)
		if err != nil {
			setTaskFailAndClean(zipWriter, createArchiveWriter, taskId, archiveFilePath, fmt.Sprintf("Failed to unzip file %s\n%v", zipFilePath, err))
			return
		}

		_, err = io.Copy(zipFileWriter, xzReader)
		if err != nil {
			setTaskFailAndClean(zipWriter, createArchiveWriter, taskId, archiveFilePath, fmt.Sprintf("Failed to copy unzip file %s in archive\n%v", zipFilePath, err))
			return
		}
		task = runningCollectTasks[taskId]
		task.ProcessedFiles = idx + 1
		runningCollectTasks[taskId] = task
	}
	zipWriter.Close()
	createArchiveWriter.Close()

	var compressedBytes bytes.Buffer
	writer, err := xz.NewWriter(&compressedBytes)
	defer writer.Close()
	if err != nil {
		task.Failed = true
		task.FailedReason = fmt.Sprintf("Failed to create compress writer\n%v", err)
		runningCollectTasks[taskId] = task
		os.Remove(archiveFilePath)
		return
	}

	zipArchiveFilePath := fmt.Sprintf("%s.xz", archiveFilePath)
	archiveReader, err := os.Open(archiveFilePath)
	defer archiveReader.Close()
	_, err = io.Copy(writer, archiveReader)
	err = writer.Close()
	if err != nil {
		task.Failed = true
		task.FailedReason = fmt.Sprintf("Failed to copy archive data in compress stream\n%v", err)
		runningCollectTasks[taskId] = task
		os.Remove(archiveFilePath)
		return
	}

	err = ioutil.WriteFile(
		zipArchiveFilePath,
		(&compressedBytes).Bytes(),
		0777,
	)
	if err != nil {
		task.Failed = true
		task.FailedReason = fmt.Sprintf("Failed to write compressed .tar.xz file\n%v", err)
		runningCollectTasks[taskId] = task
		os.Remove(archiveFilePath)
		return
	}
	err = os.Remove(archiveFilePath)
	if err != nil {
		task.Failed = true
		task.FailedReason = fmt.Sprintf("Failed to remove unzompressed archive\n%v", err)
		runningCollectTasks[taskId] = task
		os.Remove(zipArchiveFilePath)
		return
	}
	task.Ready = true
	task.ResultArchive = zipArchiveFilePath
	runningCollectTasks[taskId] = task
}
