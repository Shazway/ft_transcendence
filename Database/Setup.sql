CREATE DATABASE IF NOT EXISTS moumoune_db;
USE moumoune_db;

CREATE TYPE match_setting AS (
	map_appearance INT DEFAULT 0 CHECK (VALUE >= 0),
	timer INT DEFAULT 300 CHECK (VALUE <= 1200),
	is_ranked BOOLEAN DEFAULT false,
	score_to_win INT DEFAULT 5 CHECK (VALUE <= 50),
	max_players INT DEFAULT 2 CHECK (VALUE <= 2),
	round_to_win INT DEFAULT 2 CHECK (VALUE <= 10)
)

CREATE TABLE users (
	user_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	intra_id INT NOT NULL UNIQUE,
	username VARCHAR(20) NOT NULL UNIQUE,
	nickname VARCHAR(10) NOT NULL UNIQUE,
	img_url VARCHAR(255) DEFAULT NULL,
	rank_score INT DEFAULT 0,
	activity_status int DEFAULT 0,
	FOREIGN KEY (channels) REFERENCES channels (channel_id) ON DELETE CASCADE
);

/* Relational table to express friends and blacklisted of a user */

CREATE TABLE user_relation (
	user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
	friend_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
	is_blacklisted BOOLEAN DEFAULT false,
	PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE achievements (
	achievement_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	achievement_name VARCHAR(255) DEFAULT NULL,
	achievement_description VARCHAR (1024) DEFAULT NULL,
	achievement_condition VARCHAR (1024) DEFAULT NULL
);

/* Relational table to express the achievements of a user */

CREATE TABLE user_achievements (
	user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
	achievement_id INTEGER REFERENCES achievements (achievement_id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE matchs (
	match_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	match_is_ranked BOOLEAN DEFAULT false,
	match_settings match_setting,
);

/* Relational table to express the match history of a user */

CREATE TABLE match_history (
	user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
	match_id INTEGER REFERENCES matchs (match_id) ON DELETE CASCADE,
	score INT DEFAULT 0,
	round_won INT DEFAULT 0,
	is_ongoing BOOLEAN DEFAULT true,
	is_victory BOOLEAN DEFAULT false,
	PRIMARY KEY (user_id, match_id)
);

CREATE TABLE channels (
	channel_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	channel_name VARCHAR(20) NOT NULL UNIQUE,
	channel_password VARCHAR(30) DEFAULT NULL,
	is_channel_private BOOLEAN DEFAULT false
);

/* Relational table to express the users of a channel */

CREATE TABLE channel_user (
	user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
	channel_id INTEGER REFERENCES channels (channel_id) ON DELETE CASCADE,
	is_creator BOOLEAN DEFAULT false,
	is_admin BOOLEAN DEFAULT false,
	is_muted BOOLEAN DEFAULT false,
	is_banned BOOLEAN DEFAULT false,
	remaining_time TIMESTAMP DEFAULT NULL,
	PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE messages (
	message_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	message_content VARCHAR(255) NOT NULL,
	message_timestamp TIMESTAMP NOT NULL,
	FOREIGN KEY (message_author) REFERENCES users (user_id) ON DELETE CASCADE,
	FOREIGN KEY (channel_id) REFERENCES channels (channel_id) ON DELETE CASCADE,
);

/* Notifications type:
 * - "Friend Request"
 * - "Match Invite"
 * - "Get Achievement"
 * - "Channel Notif"
 * - "Message Ping"
 */

CREATE TABLE notification (
	notif_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
	notif_content VARCHAR(255) NOT NULL,
	notif_type VARCHAR(20) NOT NULL,
	FOREIGN KEY (link_to_match) REFERENCES matchs (match_id) DEFAULT NULL ON DELETE SET DEFAULT,
	FOREIGN KEY (link_to_friend) REFERENCES users (user_id) DEFAULT NULL ON DELETE SET DEFAULT,
	FOREIGN KEY (link_to_channel) REFERENCES channels (channel_id) DEFAULT NULL ON DELETE SET DEFAULT
)