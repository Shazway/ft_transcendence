/* Request all friends from a user */
SELECT r.user_id, u.username
FROM users u JOIN user_relation r ON u.user_id = r.friend_id
WHERE f.user_id = ? AND r.is_blacklisted = false;

INSERT INTO users VALUES (1, 5, 'asef', 'qwef');