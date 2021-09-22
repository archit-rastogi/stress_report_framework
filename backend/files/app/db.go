package main

import (
	"database/sql"
	"fmt"
	"github.com/google/uuid"
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
