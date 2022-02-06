package main

import (
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"log"
	"time"
)

var connection *sql.DB

func checkConnection() error {
	if connection == nil {
		fmt.Println("~?~ create connection")
		var err error
		connection, err = sql.Open(
			"postgres",
			fmt.Sprintf(
				"user=%v password=%v dbname=%v host=%v port=%v sslmode=disable",
				dbUser, dbPassword, dbName, dbHost, dbPort,
			),
		)
		if err != nil {
			connection = nil
			return err
		}
	}
	return nil
}

func dbAddFile(name string) error {
	err := checkConnection()
	if err != nil {
		return err
	}
	id := uuid.New()
	_, err = connection.Exec(
		"INSERT INTO files(file_id, time, name) values ($1, $2, $3)", id.String(), time.Now(), name,
	)
	if err != nil {
		return err
	}
	return nil
}

func dbExistsFile(name string) (bool, error) {
	err := checkConnection()
	if err != nil {
		return false, err
	}
	var exists bool
	err = connection.QueryRow("SELECT EXISTS(SELECT file_id FROM FILES WHERE name = $1)", name).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func dbRemoveFile(name string) error {
	err := checkConnection()
	if err != nil {
		return err
	}
	_, err = connection.Exec("DELETE FROM FILES WHERE name = $1", name)
	return err
}

func dbGetAttachmentsBatch(attachmentId string, pattern string) ([][]string, error) {
	err := checkConnection()
	var result [][]string
	if err != nil {
		return result, err
	}
	rows, err := connection.Query("select source, name from attachments where type = 'file' and name ~ $1 and test_id = $2;", pattern, attachmentId)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var source string
		var name string
		err = rows.Scan(&source, &name)
		if err != nil {
			return result, err
		}
		var row []string
		row = append(row, source)
		row = append(row, name)
		result = append(result, row)
	}
	return result, nil
}
