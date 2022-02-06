package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
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

func response(w http.ResponseWriter, code int, msg string) {
	w.WriteHeader(code)
	w.Write([]byte(msg))
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

func prepareTmpDir() {
	err := os.MkdirAll(tempDir, os.ModePerm)
	if err != nil {
		log.Fatal(fmt.Sprintf("Failed to create temp directory %s", tempDir))
	}
	rand.Seed(time.Now().UnixNano())
	files, err := os.ReadDir(tempDir)
	if err != nil {
		log.Fatal(fmt.Sprintf("Failed to read directory %v", tempDir))
	}
	for _, file := range files {
		os.Remove(fmt.Sprintf("%s/%s", tempDir, file.Name()))
	}
}
