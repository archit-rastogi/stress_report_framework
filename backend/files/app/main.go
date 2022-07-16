package main

import (
	"bytes"
	"fmt"
	_ "github.com/lib/pq"
	"github.com/ulikunitz/xz"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var storagePath = os.Getenv("STORAGE_PATH")
var tempDir = fmt.Sprintf("%v/tmp", storagePath)

var dbUser = os.Getenv("DB_USER")
var dbPassword = os.Getenv("DB_PASSWORD")
var dbName = os.Getenv("DB_NAME")
var dbHost = os.Getenv("DB_HOST")
var dbPort = os.Getenv("DB_PORT")

var runningCollectTasks = make(map[string]CollectTask)

func add(w http.ResponseWriter, r *http.Request) {
	data, _, err := r.FormFile("file")
	if data == nil {
		response(w, 200, "Nothing is added, file is empty")
		return
	} else {
		defer data.Close()
	}
	if err != nil {
		response(w, 400, fmt.Sprintf("Failed to get file data from request: %v", err))
	}
	realName := r.Header.Get("name")
	zipName := fmt.Sprintf("%v.xz", realName)
	fmt.Println(fmt.Sprintf("-> %v", realName))

	fileDir := getAbsoluteFileDirPath(zipName)

	err = os.MkdirAll(fileDir, os.ModePerm)
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to create directory: %v", err))
		return
	}

	var compressedBytes bytes.Buffer
	writer, err := xz.NewWriter(&compressedBytes)
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to open writer %v", err))
	}

	bytesWritten, err := io.Copy(writer, data)
	err = writer.Close()
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to write compressed file %v", err))
	}

	err = ioutil.WriteFile(
		getAbsoluteFilePath(zipName),
		(&compressedBytes).Bytes(),
		0777,
	)
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to write file. err: %v", zipName))
		return
	}
	err = dbAddFile(realName, bytesWritten)
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to add to DB. err: %v", err))
		return
	}
	response(w, 200, "Added")
}

func get(w http.ResponseWriter, r *http.Request) {
	realName := r.URL.Query().Get("name")
	zipName := fmt.Sprintf("%v.xz", realName)
	fmt.Println(fmt.Sprintf("<- %v", realName))

	exists, err := dbExistsFile(realName)
	if err != nil {
		response(w, 500, fmt.Sprintf("Can't check file exists %v. Err: %v", realName, err))
		return
	}
	if exists {
		readBytes, err := ioutil.ReadFile(getAbsoluteFilePath(zipName))
		if err != nil {
			response(w, 500, fmt.Sprintf("Failed to find file on disk. err: %v", err))
			return
		}

		readBuffer := bytes.NewBuffer(readBytes)
		xzReader, err := xz.NewReader(readBuffer)
		if err != nil {
			response(w, 500, "Failed to create xz reader")
			return
		}

		_, err = io.Copy(w, xzReader)
		if err != nil {
			response(w, 500, "Failed to write file in ")
			return
		}
	} else {
		response(w, 404, fmt.Sprintf("Failed to find file %v", realName))
	}
}

func remove(w http.ResponseWriter, r *http.Request) {
	realName := r.URL.Query().Get("name")
	fmt.Println(fmt.Sprintf("x %v", realName))
	zipName := fmt.Sprintf("%v.xz", realName)

	err := dbRemoveFile(realName)
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to remove file from DB. err: %v", err))
	}

	err = os.Remove(getAbsoluteFilePath(zipName))
	if err != nil {
		response(w, 500, fmt.Sprintf("Failed to delete file. err: ", err))
		return
	}

	indents := []int{6, 4, 2}
	removeFileDirPath := getAbsoluteFileDirPath(zipName)
	dirFiles, _ := ioutil.ReadDir(removeFileDirPath)
	if len(dirFiles) == 0 {
		_ = os.RemoveAll(removeFileDirPath)
	}
	for _, indent := range indents {
		removeFileDirPath = removeFileDirPath[:len(removeFileDirPath)-indent-1]
		dirFiles, _ := ioutil.ReadDir(removeFileDirPath)
		if len(dirFiles) == 0 {
			_ = os.RemoveAll(removeFileDirPath)
		} else {
			break
		}
	}
	response(w, 200, "Removed")
}

func buildArchive(w http.ResponseWriter, r *http.Request) {
	testId := r.URL.Query().Get("test_id")
	pattern := r.URL.Query().Get("pattern")
	taskId := RandStringRunes(10)
	runningCollectTasks[taskId] = CollectTask{
		pattern,
		testId,
		0,
		0,
		false,
		false,
		"",
		"",
	}

	go collectArchive(taskId, pattern, testId)
	http.Redirect(w, r, strings.ReplaceAll(r.URL.Path, "build_archive", fmt.Sprintf("get_archive?task_id=%s", taskId)), http.StatusSeeOther)
}

func getArchive(w http.ResponseWriter, r *http.Request) {
	taskId := r.URL.Query().Get("task_id")
	if task, ok := runningCollectTasks[taskId]; ok {
		if task.Ready {
			reader, err := os.Open(task.ResultArchive)
			fileName := filepath.Base(task.ResultArchive)
			if err != nil {
				response(w, 500, fmt.Sprintf("Failed to optn archive %s \n%v", fileName, err))
			}
			w.Header().Add("Content-Disposition", fmt.Sprintf("attachment;filename=%s", fileName))
			w.Header().Add("Content-Type", "application/octet-stream")
			_, err = io.Copy(w, reader)
			if err != nil {
				response(w, 500, fmt.Sprintf("Failed to read archive %s \n%v", fileName, err))
			}
			delete(runningCollectTasks, taskId)
			os.Remove(task.ResultArchive)
		} else if task.Failed {
			response(w, 500, fmt.Sprintf("Task failed\n%s", task.FailedReason))
			delete(runningCollectTasks, taskId)
		} else {
			response(w, 200, fmt.Sprintf(""+
				"<html>"+
				"<body>"+
				"Task in progress</br>Processed files: %v/%v"+
				"</br>"+
				"Please refresh table to get result or wait for page restart in 2 second"+
				"</body>"+
				"<script>setTimeout(() => location.reload(), 2000)</script>"+
				"</html>", task.ProcessedFiles, task.FilesToProcess))
		}
	} else {
		response(w, 404, "Can't find task")
	}
}

func getAllTasks(w http.ResponseWriter, r *http.Request) {
	text := "<table><tr><th>Task ID</th><th>Ready</th><th>Failed</th><th>Failed reason</th><th>Processed files</th></tr>"
	for k, v := range runningCollectTasks {
		text = text + fmt.Sprintf("<tr><td>%s</td><td>%v</td><td>%v</td><td>%s</td><td>%s</td></tr>", k, v.Ready, v.Failed, v.FailedReason, fmt.Sprintf("%v/%v", v.ProcessedFiles, v.FilesToProcess))
	}
	text = text + "</table>"
	response(w, 200, text)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	taskId := r.URL.Query().Get("task_id")
	task := runningCollectTasks[taskId]
	if _, err := os.Stat(task.ResultArchive); os.IsNotExist(err) {
		os.Remove(task.ResultArchive)
	}
	delete(runningCollectTasks, taskId)
	response(w, 200, "Deleted")
}

func main() {
	prepareTmpDir()
	http.HandleFunc("/files/add", add)
	http.HandleFunc("/files/get", get)
	http.HandleFunc("/files/build_archive", buildArchive)
	http.HandleFunc("/files/get_archive", getArchive)
	http.HandleFunc("/files/get_all_tasks", getAllTasks)
	http.HandleFunc("/files/delete_task", deleteTask)
	http.HandleFunc("/files/remove", remove)
	http.ListenAndServe(":9998", nil)
}
