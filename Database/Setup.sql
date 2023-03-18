CREATE DATABASE moumoune_db;
USE moumoune_db;

CREATE TYPE match_setting AS (
	map_appearance INT DEFAULT 0 CHECK (VALUE >= 0),
	timer INT DEFAULT 300 CHECK (VALUE <= 1200),
	is_ranked BOOLEAN DEFAULT false,
	score_to_win INT DEFAULT 5 CHECK (VALUE <= 50),
	max_players INT DEFAULT 2 CHECK (VALUE <= 2),
	round_to_win INT DEFAULT 2 CHECK (VALUE <= 10)
)

CREATE TYPE played_match AS (
	FOREIGN KEY (match) REFERENCES match (match_id) ON DELETE CASCADE,
	score INT DEFAULT 0,
	round_won INT DEFAULT 0
)

CREATE TABLE users (
	user_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	intra_id INT NOT NULL UNIQUE,
	username VARCHAR(20) NOT NULL UNIQUE,
	nickname VARCHAR(10) NOT NULL UNIQUE,
	img_url VARCHAR(255) DEFAULT NULL,
	rank_score INT DEFAULT 0,
	activity_status int DEFAULT 0,
	match_history played_match[],
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
	match_settings match_setting,
	FOREIGN KEY (spectators) REFERENCES users (user_id) ON DELETE CASCADE,
	FOREIGN KEY (player) REFERENCES users (user_id) ON DELETE CASCADE
);