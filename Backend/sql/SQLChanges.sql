CREATE TABLE `aldi_chat`.`messages` (
	`message_id` INT NOT NULL AUTO_INCREMENT,
	`sender` INT NOT NULL,
	`recipent` INT NULL,
	`message` LONGTEXT NULL,
	PRIMARY KEY (`message_id`));
  
CREATE TABLE `aldi_chat`.`users` (
	`uid` INT NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(64) NOT NULL,
	PRIMARY KEY (`uid`));
	
use aldi_chat;
create view aldi_chat.view_messages_with_username as
select messages.*, senderUser.username as senderUsername, recipentUser.username as recipentUsername from messages
 left join users as senderUser on messages.sender=senderUser.uid 
 left join users as recipentUser on messages.recipent=recipentUser.uid;

