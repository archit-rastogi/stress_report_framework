package main

import (
	"fmt"
	"net/http"
)

func getAbsoluteFileDirPath(fileName string) string {
	return fmt.Sprintf("%v/%v", storagePath, getRelevantDirPath(fileName))
}

func getRelevantDirPath(fileName string) string {
	return fmt.Sprintf("%v/%v/%v/%v", fileName[:1], fileName[:2], fileName[:4], fileName[:6])
}

func getAbsoluteFilePath(fileName string) string {
	return fmt.Sprintf("%v/%v", getAbsoluteFileDirPath(fileName), fileName)
}

func getRelevantFilePath(fileName string) string {
	return fmt.Sprintf("%v/%v", getRelevantDirPath(fileName), fileName)
}

func response(w http.ResponseWriter, code int, msg string) {
	w.WriteHeader(code)
	w.Write([]byte(msg))
}
