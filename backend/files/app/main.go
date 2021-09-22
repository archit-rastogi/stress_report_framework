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
)

var storagePath = os.Getenv("STORAGE_PATH")

var dbUser = os.Getenv("DB_USER")
var dbPassword = os.Getenv("DB_PASSWORD")
var dbName = os.Getenv("DB_NAME")
var dbHost = os.Getenv("DB_HOST")
var dbPort = os.Getenv("DB_PORT")

func add(w http.ResponseWriter, r *http.Request) {
	data, _, err := r.FormFile("file")
	if data != nil {
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

	_, err = io.Copy(writer, data)
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
	err = dbAddFile(realName)
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
		w.Header().Add("Content-Disposition", realName)
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

func main() {
	http.HandleFunc("/files/add", add)
	http.HandleFunc("/files/get", get)
	http.HandleFunc("/files/remove", remove)
	http.ListenAndServe(":9998", nil)
}
