CREATE DATABASE moumoune_db;
USE moumoune_db;

CREATE TYPE match_settings AS (
	MapAppearance INT DEFAULT 0,
	Timer
)

CREATE TABLE users (
	user_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	intra_id INT NOT NULL UNIQUE,
	username VARCHAR(20) NOT NULL UNIQUE,
	nickname VARCHAR(10) NOT NULL UNIQUE,
	img_url VARCHAR(255) DEFAULT NULL,
	rank_score INT DEFAULT 0,
	activity_status int DEFAULT 0,
	FOREIGN KEY (achievement_list) REFERENCES achievements (achievement_id) ON DELETE CASCADE,
	FOREIGN KEY (friends) REFERENCES users (user_id) ON DELETE CASCADE,
	FOREIGN KEY (blacklist) REFERENCES users (user_id) ON DELETE CASCADE,
	FOREIGN KEY (channels) REFERENCES channels (channel_id) ON DELETE CASCADE
);

CREATE TABLE achievements (
	achievement_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	achievement_name VARCHAR(255) DEFAULT NULL,
	achievement_description VARCHAR (1024) DEFAULT NULL,
	achievement_condition VARCHAR (1024) DEFAULT NULL
);

CREATE TABLE match (
	match_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	match_is_ranked BOOLEAN DEFAULT false,
	match_settings 
	FOREIGN KEY (spectators) REFERENCES users (user_id) ON DELETE CASCADE,
);