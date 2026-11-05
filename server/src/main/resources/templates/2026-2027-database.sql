CREATE DATABASE  IF NOT EXISTS "lankacapital" /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lankacapital`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: chirathwijesinghe123-48fc-chirathwijesinghe123-48fc.g.aivencloud.com    Database: lankacapital
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '100ea21e-9471-11f1-895c-0ac17152fd24:1-206,
1b6628ad-0e3b-11f1-ab9f-d6ef379d5f62:1-28,
341a380d-74b9-11f1-bc45-0a576f0c4dec:1-1120,
4b254c07-1544-11f1-88dc-6abdeb077e56:1-1601,
64e3a81c-bc3b-11f1-8899-1a73182a1f59:1-272,
b274e82e-9c55-11f1-bf9b-ced168a6919a:1-639';

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `asset_name` varchar(255) DEFAULT NULL,
  `purchased_date` date DEFAULT NULL,
  `rate` double DEFAULT NULL,
  `depreciated_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,153700.00,'Furniture & Fittings','2026-04-03',5,'2027-03-12'),(2,4600.00,'Office Equipment','2026-04-06',5,'2027-03-12'),(3,35000.00,'Computer & Printers','2026-04-28',5,'2027-03-12'),(6,82500.00,'Furniture & Fittings','2026-04-28',5,'2027-03-12'),(9,36340.00,'Telephone','2026-04-07',5,'2027-03-12'),(10,23690.00,'CCTV Camera','2026-04-28',5,'2027-03-12');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_flow_data`
--

DROP TABLE IF EXISTS `cash_flow_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_flow_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cash_in_hand_amount` decimal(38,2) DEFAULT NULL,
  `financial_date` date DEFAULT NULL,
  `opening_cash_balance` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_flow_data`
--

LOCK TABLES `cash_flow_data` WRITE;
/*!40000 ALTER TABLE `cash_flow_data` DISABLE KEYS */;
INSERT INTO `cash_flow_data` VALUES (1,150000.00,'2027-03-31',200000.00);
/*!40000 ALTER TABLE `cash_flow_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `nic` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `bank` varchar(255) DEFAULT NULL,
  `bank_account` varchar(255) DEFAULT NULL,
  `deleted` bit(1) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `update_status` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`nic`),
  KEY `FK893lhkqrrmyse3hf9eb1hbv2e` (`created_by`),
  KEY `FKo3085rmxv0yy6f3u8k7hbtk1d` (`role_id`),
  KEY `FKkk1a73kmxs1iwl5aasqb6gret` (`updated_by`),
  CONSTRAINT `FK893lhkqrrmyse3hf9eb1hbv2e` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKkk1a73kmxs1iwl5aasqb6gret` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKo3085rmxv0yy6f3u8k7hbtk1d` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('123456789123','kuruwita ',NULL,NULL,_binary '\0','lanka@gmail.com','kumara abm','0767069100',0,NULL,4,NULL),('123540120567','kuruwita ',NULL,NULL,_binary '\0','kumara@gmail.com','kumara amila','0767816872',0,NULL,4,NULL),('196 754 802 560','Paradise, Kuruwita','','',_binary '\0','','Delkadura Arachchige Nalini','0765522141',0,1,4,NULL),('196033600206','316/D/1, Moragala Road, Bulugahapitiya, Ehaliyagoda','','',_binary '\0','','M.A. Thilaka','0775560741',0,39,4,NULL),('196381902810','15, Samagipura, Rathnapura','','',_binary '\0','','P.A.A.S. Kumari','0714624997',0,39,4,NULL),('196386401178','thalawitiya parkaduwa',NULL,NULL,_binary '\0','Pathmini@gmail.com','iminamilage sunitha padmini','0714992758',0,NULL,4,NULL),('196934100827','807/A/1, Guruluwana Road, Eknaligoda, Kuruwita','','',_binary '\0','','W.A. Chamil Dammika','0765490997',0,39,4,NULL),('197 632 501 144','Paradise, Kuruwita','','',_binary '\0','','Bogala Kaluarachchilage  Wasantha Bandara ','0712618952',0,1,4,NULL),('197222003410','129 paranoid watchable hunugaldeniya kuruwita',NULL,NULL,_binary '\0','jeganadan@gmail.com','Kalidas jeganadan','0715311822',0,NULL,4,NULL),('197617801499','131/1,Batathota ,Kuruwita ',NULL,NULL,_binary '\0','thusith@gmail.com','Keeragala Arachchige Thusith Premakumara','0765689157',0,NULL,4,NULL),('197686502651','Factory street,Maliboda',NULL,NULL,_binary '\0','Ammalu@gmail.com','Abimannan Ammalu','0765663267',0,NULL,4,NULL),('197981303667','R/5/5, Weediyawaththa, Miyanavita, Deraniyagala',NULL,NULL,_binary '\0','Iresha@gmail.com','Waraka Waththage Iresha Lakmali','0722403075',0,NULL,4,NULL),('198 609 003 202','Lassakanda, Erathna','','',_binary '\0','','Kaluwalage Sumith Disanayaka','0712618952',0,1,4,NULL),('198230900085','ERATHNA KURUWITA ',NULL,NULL,_binary '\0','SIRIPALA@GMAIL.COM','ATHWAL GAMAATHIGE SADAMALI SIRIPALA','0715801212',0,NULL,4,NULL),('198230990085','erathna kuruwita',NULL,NULL,_binary '\0','sadamal@gmail.com','athwal gamaathige sadamali siripala','0714256781',0,NULL,4,NULL),('198231900085','S25,Hathkela,Miyanawita,deraniyagala ',NULL,NULL,_binary '\0','Ranashinha@gmail.com','UNDUGODA DEWAGE RANASHINHA ','0773544933',0,NULL,4,NULL),('198405804410','no 165, 5 kanuwa batathota kuruwita',NULL,NULL,_binary '\0','manjula@gmail.com','galahena kandage manjula priyantha kumara','0761930857',0,NULL,4,NULL),('198527102700','kuruwita ',NULL,NULL,_binary '\0','kamal@gmail.com','kamal amila','0767068105',0,NULL,4,NULL),('198609003202','S/48/4,Hathkela,Deraniyagala ',NULL,NULL,_binary '\0','sumith@gmail.com','kaluwalage smith disanayaka','0724473011',0,NULL,4,NULL),('199502602320','Miyanawita,Deraniyagala ',NULL,NULL,_binary '\0','prassanna@gmail.com','Balakrishnan prasanna','0743224552',0,NULL,4,NULL),('199860900320','pathagama kuruwiya',NULL,NULL,_binary '\0','sumit@gmail.com','kaluwalage sumith disanayak','0764523891',0,NULL,4,NULL),('200002110119','Q/79/1,Kosgahakanda,Miyanawita,Deraniyagala ',NULL,NULL,_binary '\0','Akalanka@gmail.com','Kande badalge chamod  heshan akalanka','0765749843',0,NULL,4,NULL),('200227800588','Horana','','',_binary '\0','','Chirath Wijesinghe','0786268640',1,1,4,NULL),('655531153','B/348/3,B purana mawatha,Dakuna Deraniyagala ',NULL,NULL,_binary '\0','manike@gmail.com','Gamehitiralage Gunathunga manike','0762958379',0,NULL,4,NULL),('655531153V','B/348/3,B purana mawatha,Dakuna Deraniyagala ',NULL,NULL,_binary '\0','manike@gmail.com','Gamehitiralage Gunathunga manike','0762958379',0,NULL,4,NULL),('655532153V','B/348/3,Purahana wihara marathon,deraniyagala dakuna,deraniyagala ',NULL,NULL,_binary '\0','manike@gmail.com','Gamahethiralage Gunathunge manike','0762958379',0,NULL,4,NULL),('660123849v','hidellana rarhnapura',NULL,NULL,_binary '\0','sarath@gmail.com','dolewaththa appohamilage sarath kumara','0703983479',0,NULL,4,NULL),('667557442V','591,Pannama,Sudagala,Kuruwita ',NULL,NULL,_binary '\0','Sarath@gmail.com','Hetti Arachchilage Sarath Dharmarathna Weeradingha','0765365156',0,NULL,4,NULL),('680492611v','431 dewalapara namaldeniya parakaduwa',NULL,NULL,_binary '\0','sunil@gmail.com','wickramasuriyge sunil shantha','0717453178',0,NULL,4,NULL),('680544611V','585/5,4patumaga,Hiddellana, Rathnapura',NULL,NULL,_binary '\0','','Rajapaksha Mudiyanselage Sunil Shantha Bandara ','0716332987',0,43,4,NULL),('720630940V','121,Colombo road,delgamuwa,kuruwita ',NULL,NULL,_binary '\0','pushpakumara@gmail.com','Thanthara Arachchilage pushpakumara thanthraarachchi ','0740579687',0,NULL,4,NULL),('741835550v','No20/1 Assemanakanda,Yatiwala ',NULL,NULL,_binary '\0','lechcheman@gmail.com','Vellasami Lechcheman','0772649146',0,NULL,4,NULL),('761380729v','millawitiya kuruwita ',NULL,NULL,_binary '\0','Lalin@gmail.com','Lalin suriyaarachchi','0703938965',2,NULL,4,NULL),('768462402V','28A,PARATHALAKANDA,ERATHNA','','',_binary '\0','','GALKARAVUNGE KANTHILATHA','0712139200',0,1,4,NULL),('781604453v','252/2, Malangama, Hidallana, Rathnapura','','',_binary '\0','','M.K.T. Chandrasiri','0713021253',0,39,4,NULL),('790100522v','Attalawatta, Malangama, Rathnapura','','',_binary '\0','','R.A.M.P. Rajapaksha','0713140970',0,39,4,NULL),('816 533 449V','29/4, Parathalakanda Ihala, Erathna','Commercial bank - Kuruwita','8075001234',_binary '\0','','Munangala Arachchilage Wasanthi Senavirathna ','0740345264',0,1,4,NULL),('833381199V','KURUWITA','','',_binary '\0','','H A T T Seviyer','0712618952',0,1,4,NULL),('841413210V','Laksakanda,Erathna ,Kuruwita ',NULL,NULL,_binary '\0','janakapradeep@gmail.com','Yatiwala Witharamalage Janaka Pradeep Yatiwala','0774496273',0,NULL,4,NULL),('842871018v','leelawsththa,batathota,kuruwita',NULL,NULL,_binary '\0','anurakumara@gmail.com','kosgala wikrama arachchilage aura kumara weerasingha','0770293553',0,NULL,4,NULL),('852301520V','Lassakanda, Erathna','','',_binary '\0','dinesha@gmail.com','Disanayaka Mudiyanselage Dinesh Kumara ','0778357610',0,1,4,NULL),('865783230V','S/36/S,Hathkela,Deraniyagala ',NULL,NULL,_binary '\0','manel123@gmail.com','Manel Disanayaka','0743320220',0,NULL,4,NULL),('878115503V','190A, Gagabada,Erathna',NULL,NULL,_binary '\0','lankacapitalc@gmail.com','PP Rupika Lakmali Wimalasooriya','0766525726',0,NULL,4,NULL),('882060943v','kuruwita ',NULL,NULL,_binary '\0','lanka@gmail.com','kumara amal','0767069100',0,NULL,4,NULL),('882763940V','kuruwita ',NULL,NULL,_binary '\0','lanka@gmail.com','kumara amal','0767069100',0,NULL,4,NULL),('882763943v','kuruwita ',NULL,NULL,_binary '\0','lanka@gmail.com','kumara amal','0767069100',0,NULL,4,NULL),('882901826v','kiuwama ',NULL,NULL,_binary '\0','kuna@gmail.com','kunusu','0767069104',0,NULL,4,NULL),('886283245v','lassakanda,erathna ',NULL,NULL,_binary '\0','sadamali@gmail.com','athwel gama ethirallage sadamali siripala','0701953058',0,NULL,4,NULL),('913 043 901V','KURUWITA','','',_binary '\0','','Udahageyalage Deepthi Prasanna Somaweera','0767069105',0,1,4,NULL),('915142052V','Paradise, Kuruwita','','',_binary '\0','','Kanchana Ekanayaka','0767069105',0,1,4,NULL),('926424874V','Assemanakanda kotasa,Deraniyagala ',NULL,NULL,_binary '\0','balakrishnan@gmail.com','Balakrishnan Sivalechchemi','0767924128',0,NULL,4,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_collections`
--

DROP TABLE IF EXISTS `daily_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_collections` (
  `id` binary(16) NOT NULL,
  `due_amount` decimal(12,2) DEFAULT NULL,
  `installment_number` int DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_status` bigint DEFAULT NULL,
  `entered_by` bigint DEFAULT NULL,
  `loan_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsspeqbkwt35vblh299lk926je` (`entered_by`),
  KEY `FKj7depmjarndc5nb8ssf7b6y14` (`loan_id`),
  CONSTRAINT `FKj7depmjarndc5nb8ssf7b6y14` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`),
  CONSTRAINT `FKsspeqbkwt35vblh299lk926je` FOREIGN KEY (`entered_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_collections`
--

LOCK TABLES `daily_collections` WRITE;
/*!40000 ALTER TABLE `daily_collections` DISABLE KEYS */;
INSERT INTO `daily_collections` VALUES (_binary 'Ù\Â?A›∑Ω®f\Ô;∏',-2437.50,6,0.00,'2026-11-01 00:00:00',0,2,22),(_binary 'B5\œYD±¨¢Úﬁ∏lá',-2437.50,3,0.00,'2026-10-29 00:00:00',0,2,22),(_binary '†à:ŸåH∑\0\Íâ	uê',-1933.33,1,0.00,'2026-10-27 10:30:00',0,2,26),(_binary '∞avÛ\rBîç>\ŸQ*\Zú\≈',-1377.78,4,0.00,'2026-10-30 00:00:00',0,2,52),(_binary '˜∂\«DJ˛¢π\·\·eL',-600.00,6,0.00,'2026-11-01 00:00:00',0,2,5),(_binary '\◊\'}DFªV˛P\›\‚<',-696.00,2,0.00,'2026-10-28 00:00:00',0,2,38),(_binary '¥7πùEå¶i\“b∂˛\Œ\·',-1377.78,6,0.00,'2026-11-01 00:00:00',0,2,52),(_binary 'R‚©∂`E3â“†O\≈˙à',-696.00,2,0.00,'2026-10-28 00:00:00',0,2,31),(_binary 'å\œ\∆b IΩ¢µ5\«QdKa',-966.67,3,0.00,'2026-10-29 00:00:00',0,2,15),(_binary 'Å©ºûIÁÇª\Ì_¶',-400.00,2,0.00,'2026-10-28 00:00:00',0,2,49),(_binary '\n\‚é\ŒBIA¶\'J\Ì6\Z\»\∆',-696.00,1,0.00,'2026-10-27 10:30:00',0,2,34),(_binary 'dn4XN¢òÇ>æCbØ',-69.60,1,0.00,'2026-10-27 10:30:00',0,2,27),(_binary 'î â<\\G\Z≤M≠õu\‘.',-1256.67,1,0.00,'2026-10-27 10:30:00',0,2,25),(_binary '\ÔóΩ\ﬂA·•Ü°¿Ÿ¢ã',-966.67,5,0.00,'2026-10-31 00:00:00',0,2,6),(_binary 'i0öO˝Fræå\’BS^4',-800.00,3,0.00,'2026-10-29 00:00:00',0,2,17),(_binary 'lyê\ÌFƒ∑D8,0;Ç',-69.60,2,0.00,'2026-10-28 00:00:00',0,2,33),(_binary 'tˇé8˙K—≠\n[≤0En',-966.67,1,0.00,'2026-10-27 10:30:00',0,2,6),(_binary 'Ω≠M¬∏∂\ Òôk1*',-1800.00,7,0.00,'2026-11-02 00:00:00',0,2,40),(_binary 'ØÅ\Õ\ƒ\‹Im¥ˆ;\Ã\œ\‚',-1800.00,1,0.00,'2026-10-27 10:30:00',0,2,40),(_binary 'm\Ó’ñßEµ¥o\»^+\‡™',-696.00,5,0.00,'2026-10-31 00:00:00',0,2,31),(_binary '´1F˛æFL≥ı\Zú\\§l\ƒ',-12187.50,1,0.00,'2026-10-28 00:00:00',0,2,13),(_binary '¡ßèªcN˝ªÅ7\».L\Í',-69.60,4,0.00,'2026-10-30 00:00:00',0,2,28),(_binary '\À3¢\◊AC˘ªc0\Ó[d\Z{',-696.00,3,0.00,'2026-10-29 00:00:00',0,2,31),(_binary ' Gb?ºF÷Ø≤•˙3#\È',-2066.67,2,0.00,'2026-10-28 00:00:00',0,2,35),(_binary '!\rW\≈\¬)AæÙM\·≠4p@',-2437.50,5,0.00,'2026-10-31 00:00:00',0,2,22),(_binary '!≥S(HKŒü®n@^c\Âq',-69.60,3,0.00,'2026-10-29 00:00:00',0,2,28),(_binary '#\”\ŸdKëùeokóùe',-1256.67,6,0.00,'2026-11-01 00:00:00',0,2,25),(_binary '#\ﬂJO˙ IaÇÆXõB∫r',-1625.00,1,0.00,'2026-10-28 00:00:00',0,2,21),(_binary ')N©z\÷TI6Ω\œ.\‡\Êõˆ',-2000.00,1,0.00,'2026-10-27 10:30:00',0,2,4),(_binary '+ñ\ÿ\\UF¨Å≠èöÉ]S',-1377.78,3,0.00,'2026-10-29 00:00:00',0,2,52),(_binary ',gÌä¨pLgµ\’˜0vÛ',-41.40,5,0.00,'2026-10-31 00:00:00',0,2,36),(_binary '-F[|\Ì\«Lìïb∞©!d*',-69.60,5,0.00,'2026-10-31 00:00:00',0,2,30),(_binary '.S\“d1KDr°n\ÌæÅy',-696.00,5,0.00,'2026-10-31 00:00:00',0,2,34),(_binary '/çulK{∑ÉäXo\’`\Õ',-966.67,7,0.00,'2026-11-02 00:00:00',0,2,3),(_binary '0Rõ\Ï<\ËI∑°-ö\–&',-41.40,7,0.00,'2026-11-02 00:00:00',0,2,36),(_binary '0ˆ\Ô‘ó\‚Lp≤û,oF\ﬁ2s',-580.00,3,0.00,'2026-10-29 00:00:00',0,2,18),(_binary '1FikRO,àId°:i\’M',-1000.00,4,0.00,'2026-10-30 00:00:00',0,2,50),(_binary '1\ƒ?LKçC8∑ì\ÏàX`?',-69.60,5,0.00,'2026-10-31 00:00:00',0,2,27),(_binary '4\“\Õ»ãIö´p\Í\œ\œtÄ≥',-2066.67,5,0.00,'2026-10-31 00:00:00',0,2,35),(_binary '4\Ì]q;C≠É\ÁÙΩÉ',-500.00,7,0.00,'2026-11-02 00:00:00',0,2,14),(_binary '6@ÚI©üE\‰ÉA\ƒ\Á+Ä2',-1800.00,2,0.00,'2026-10-28 00:00:00',0,2,40),(_binary '6g¡\n(¸A\‰§\‡w(c\ƒ1¥',-696.00,3,0.00,'2026-10-29 00:00:00',0,2,38),(_binary '9w}¬ç\‹@˜ú)¯xg…ó',-966.67,4,0.00,'2026-10-30 00:00:00',0,2,15),(_binary '9é˜\‰(\€C⁄≤Q\‹{RÄ\Œk',-3866.67,4,0.00,'2026-10-30 00:00:00',0,2,48),(_binary '<\”2\ÂC∏∞\Õ>@eå¥',-580.00,2,0.00,'2026-10-28 00:00:00',0,2,18),(_binary '=#ÕÜüÇKZüeé˚¢\’',-1725.00,1,0.00,'2026-10-27 10:30:00',0,2,41),(_binary '=b\≈\r/GIø£\ÂmÖò',-2000.00,4,0.00,'2026-10-30 00:00:00',0,2,4),(_binary '=Ñz\Ë∆ÅC¯¶∂ªy]ª(≤',-1933.33,6,0.00,'2026-11-01 00:00:00',0,2,26),(_binary '>˘¶[Ç\ZL(∞ˇÖ*\ÀW',-1725.00,3,0.00,'2026-10-29 00:00:00',0,2,41),(_binary '?≠´`2BÖ®ˇ˜Ò|\√\„',-800.00,1,0.00,'2026-10-27 10:30:00',0,2,17),(_binary 'Ax∂üÉNçüØ˝z.í5',-400.00,2,0.00,'2026-10-28 00:00:00',0,2,16),(_binary 'B•\ZQ\0\\J-è\nOı71G\Õ',-69.60,7,0.00,'2026-11-02 00:00:00',0,2,28),(_binary 'DOñì‹ïLŒÑ-æ\ÊHÅà',-5400.00,6,0.00,'2026-11-01 00:00:00',0,2,12),(_binary 'D\”1(\ÕM€û\Ÿn∫˙˛',-2066.67,1,0.00,'2026-10-27 10:30:00',0,2,35),(_binary 'F â0IôCmÜøÑ@n|\ÿ\€',-69.60,6,0.00,'2026-11-01 00:00:00',0,2,33),(_binary 'Gy∞}u\‚C˝πa\Ì˚pv¡q',-3866.67,5,0.00,'2026-10-31 00:00:00',0,2,48),(_binary 'KRå¶\‚B∂øb\‚¯õì¸O',-966.67,2,0.00,'2026-10-28 00:00:00',0,2,6),(_binary 'Lõ9_g´Dëù\Àj0˚\…\Ó',-696.00,3,0.00,'2026-10-29 00:00:00',0,2,37),(_binary 'NáÆ∫6L/û˘∂¨æ±π\‚',-800.00,6,0.00,'2026-11-01 00:00:00',0,2,17),(_binary 'P\Z±#°%A˚Äñ\ZH∫èó',-966.67,7,0.00,'2026-11-02 00:00:00',0,2,15),(_binary 'RàG\ƒˇyM—Ä^\Ê˘z\Ÿ',-580.00,6,0.00,'2026-11-01 00:00:00',0,2,18),(_binary 'UcR\«\‰%C¯ñ\ÁÛuÖg\⁄\·',-6337.50,1,0.00,'2026-10-28 00:00:00',0,2,29),(_binary 'Uz +Lﬂñ®èZ˚:\–',-580.00,5,0.00,'2026-10-31 00:00:00',0,2,18),(_binary 'U\Í~∞ŒéKÌíπ^~\nó§à',-696.00,7,0.00,'2026-11-02 00:00:00',0,2,38),(_binary 'Vyñ—µEé_W*\ƒ†Ù',-2000.00,6,0.00,'2026-11-01 00:00:00',0,2,4),(_binary 'YX\œAªEfÑ \ÿ]\Áj\€r',-1725.00,5,0.00,'2026-10-31 00:00:00',0,2,41),(_binary 'Y\È\\\’°Cê§Ûí\€HÒ',-41.40,2,0.00,'2026-10-28 00:00:00',0,2,36),(_binary 'ZÆ<)GçL˜•*#âô\Ôó',-5400.00,4,0.00,'2026-10-30 00:00:00',0,2,12),(_binary '[ï(\÷J@èº‘òˇ˚xKX',-600.00,7,0.00,'2026-11-02 00:00:00',0,2,5),(_binary '[Gzˆ\‡äC3ºäsÚ•Øı',-800.00,2,0.00,'2026-10-28 00:00:00',0,2,17),(_binary '[¸\‹\Ë\‹eA≠î> y\Ë¯',-3866.67,6,0.00,'2026-11-01 00:00:00',0,2,48),(_binary ']f˝9º´C∞˘m®\≈ˆì\—',-696.00,7,0.00,'2026-11-02 00:00:00',0,2,34),(_binary '_V\⁄1+©AWöòlîo%&',-500.00,1,0.00,'2026-10-27 10:30:00',0,2,14),(_binary '_¿—≤ùKu´f@r∞†',-696.00,2,0.00,'2026-10-28 00:00:00',0,2,37),(_binary 'a1\ﬂ7\»Acõ§ån\n]ï',-400.00,4,0.00,'2026-10-30 00:00:00',0,2,16),(_binary 'aù\”-ï7HØ°\Ô≥)ö•»Ñ',-966.67,5,0.00,'2026-10-31 00:00:00',0,2,15),(_binary 'b≥\Ë\ﬂ@£Fê\≈¯?¯ ',-966.67,6,0.00,'2026-11-01 00:00:00',0,2,2),(_binary 'f»ΩÆHm≥\'¡\‚4\0Ñ∫',-966.67,5,0.00,'2026-10-31 00:00:00',0,2,3),(_binary 'g\À}ï\ \”A†∫l\«]vr\ﬂ+',-696.00,1,0.00,'2026-10-27 10:30:00',0,2,37),(_binary 'iÜa:∏F’ª\…&ÒÖê\Â\’',-1000.00,3,0.00,'2026-10-29 00:00:00',0,2,50),(_binary 'jöM¢OyB˙í£ßg\Ó\“o',-2437.50,1,0.00,'2026-10-28 00:00:00',0,2,24),(_binary 'kõ\›%ùúMQ≤h\…\Õ\È¶%',-3866.67,7,0.00,'2026-11-02 00:00:00',0,2,48),(_binary 'k\…!\≈a≥Nú∑ûNâC¡\◊\⁄',-41.40,6,0.00,'2026-11-01 00:00:00',0,2,36),(_binary 'l≠ò¿3EìèJ,É˛¨!j',-3866.67,2,0.00,'2026-10-28 00:00:00',0,2,48),(_binary 'mO¨»§Fâ˚\Ôâ}ÕøÄ',-5400.00,2,0.00,'2026-10-28 00:00:00',0,2,12),(_binary 'm\”‹ß?\∆H∂æî\’u\Ÿ<\"',-69.60,4,0.00,'2026-10-30 00:00:00',0,2,30),(_binary 'n\ U¸\·o@ñ£îà\"\‡\‹G',-41.40,1,0.00,'2026-10-27 10:30:00',0,2,36),(_binary 'oà\”\«\…>BõéåJ\«¡∏Y',-696.00,5,0.00,'2026-10-31 00:00:00',0,2,38),(_binary 'o™ü≈≥NÅçπéì{ÄÉ˚',-1625.00,1,0.00,'2026-10-28 00:00:00',0,2,10),(_binary 'qPCu\‚\'Ku∑çH\–›ãK$',-1000.00,1,0.00,'2026-10-27 10:30:00',0,2,50),(_binary 'r\·0ù\'FÃå\‚£`ô!˝',-966.67,6,0.00,'2026-11-01 00:00:00',0,2,6),(_binary 'sb\ÏEˇ5Gˆàë–π^Ùy',-69.60,4,0.00,'2026-10-30 00:00:00',0,2,33),(_binary 'sªÍÜ∞DÀÅè\·%\Î g',-966.67,7,0.00,'2026-11-02 00:00:00',0,2,6),(_binary 's˝òE`H™è˜@\Èr•\·',-2437.50,2,0.00,'2026-10-28 00:00:00',0,2,22),(_binary 'u\ÌI¨NëK:ò˜éÄˆT4',-966.67,1,0.00,'2026-10-27 10:30:00',0,2,15),(_binary 'vE4E?≥òΩP15\◊',-400.00,1,0.00,'2026-10-27 10:30:00',0,2,49),(_binary 'w∑§í>H±øq“©\ÿ\Z(',-400.00,3,0.00,'2026-10-29 00:00:00',0,2,49),(_binary 'xN\ﬁT\ËH≠ãê}ÖêPC',-966.67,3,0.00,'2026-10-29 00:00:00',0,2,2),(_binary 'x|\ŸNπF∫¢Loº~P',-69.60,3,0.00,'2026-10-29 00:00:00',0,2,27),(_binary '{{ßæµ_Dù\√;a\Ë\„8',-69.60,2,0.00,'2026-10-28 00:00:00',0,2,27),(_binary '|Ödï\ŸÛBÿ≤?\Îˇ\Ô',-5400.00,7,0.00,'2026-11-02 00:00:00',0,2,12),(_binary '}E<\÷QI1æLV¶∞´ı2',-2000.00,5,0.00,'2026-10-31 00:00:00',0,2,4),(_binary '}9\‡4)¥Lãmÿ£¿s2',-1625.00,1,0.00,'2026-10-28 00:00:00',0,2,23),(_binary '}e?∞Ø˙C?¢›©≥˜y\¬\”',-966.67,1,0.00,'2026-10-27 10:30:00',0,2,2),(_binary '~\Î’∏\‰BEΩ,ˇ4ãZ_',-1000.00,7,0.00,'2026-11-02 00:00:00',0,2,50),(_binary 'ÄQÒYõEoØõ@dQL≤2',-696.00,4,0.00,'2026-10-30 00:00:00',0,2,34),(_binary 'ÄT˙tB˚è\∆\‰Àè\«\Õ',-696.00,2,0.00,'2026-10-28 00:00:00',0,2,34),(_binary 'Ñ¢zx\⁄IÛ∏\È¿dÇ',-600.00,3,0.00,'2026-10-29 00:00:00',0,2,5),(_binary 'Ñ§r®ˆ!GÎüÖ3ÉVX',-696.00,5,0.00,'2026-10-31 00:00:00',0,2,37),(_binary 'Ö).\ŸTJVúê≤ı∑0~',-500.00,3,0.00,'2026-10-29 00:00:00',0,2,14),(_binary 'Ö9%cMÖæ\‘JìS\…&',-1725.00,7,0.00,'2026-11-02 00:00:00',0,2,41),(_binary 'ä≥m\·]@	í\rsŸúôæ\È',-41.40,3,0.00,'2026-10-29 00:00:00',0,2,36),(_binary 'äKˇP0©DóäC5§±¥Ö',-1377.78,5,0.00,'2026-10-31 00:00:00',0,2,52),(_binary 'ãh\„4\r FÖß\Ó\ﬁ\⁄\ﬁ≈É',-3866.67,1,0.00,'2026-10-27 10:30:00',0,2,48),(_binary 'ãs≠\ÿ˚HöÑvª\"S≈∂',-69.60,6,0.00,'2026-11-01 00:00:00',0,2,30),(_binary 'å\"z5ÖOLá\"NdÜÃµ\r',-2437.50,7,0.00,'2026-11-02 00:00:00',0,2,22),(_binary 'ç1\"-qM7ïßb¨¢\Z˙',-69.60,1,0.00,'2026-10-27 10:30:00',0,2,33),(_binary 'çÛß˝?áFo°\„\Z©\…˘å˙',-69.60,3,0.00,'2026-10-29 00:00:00',0,2,33),(_binary 'èK¡\'6H6£tdãO˚≠∫',-696.00,6,0.00,'2026-11-01 00:00:00',0,2,38),(_binary 'èÉ»ç›´A\Íå\'çLZ\Í\·C',-400.00,6,0.00,'2026-11-01 00:00:00',0,2,49),(_binary 'ê7∏Wo\◊DÄ\≈\«_\ÎóW\Ë',-69.60,1,0.00,'2026-10-27 10:30:00',0,2,28),(_binary 'ê¶¿¢àE\'´Ñ§[˙\Î1',-2437.50,4,0.00,'2026-10-30 00:00:00',0,2,22),(_binary 'îì&\Àa\ÃM√ùÆÃºá<\–',-696.00,6,0.00,'2026-11-01 00:00:00',0,2,37),(_binary 'ñú≥\Ÿ\—gLòÅ0y0Ö6',-2000.00,7,0.00,'2026-11-02 00:00:00',0,2,4),(_binary 'ñ≥z\‡≤\…M\0å\‹:Ü\Îí|',-696.00,4,0.00,'2026-10-30 00:00:00',0,2,37),(_binary 'óD¿\‰%MCg§Fvf\Œ',-696.00,3,0.00,'2026-10-29 00:00:00',0,2,34),(_binary 'öh\‡’ô?OPô\ÌY\0_Ú\ÿ',-1800.00,6,0.00,'2026-11-01 00:00:00',0,2,40),(_binary 'öëXx&ˆFÁ≠ê§1ê˝z\ÿ',-966.67,2,0.00,'2026-10-28 00:00:00',0,2,15),(_binary 'úHíõ\ÿfD˜óx´∆Äw≤_',-1933.33,5,0.00,'2026-10-31 00:00:00',0,2,26),(_binary 'ú¯Kì&\ÌIx±œ∞–§F\Õı',-696.00,6,0.00,'2026-11-01 00:00:00',0,2,34),(_binary 'ùr*0\ﬁ:M\'ï\Ï;≥C\Ë†',-966.67,3,0.00,'2026-10-29 00:00:00',0,2,6),(_binary 'ûöì\n\ÓMΩóü\Ô8[Qé',-5400.00,3,0.00,'2026-10-29 00:00:00',0,2,12),(_binary 'üdﬁÑõ@∏ú≤\≈&é7Ù2',-966.67,4,0.00,'2026-10-30 00:00:00',0,2,3),(_binary 'ü˝ö¸<ßOT∏Yø±@w\Œ',-3168.75,1,0.00,'2026-10-28 00:00:00',0,2,39),(_binary '†\”	}`Aî˙ríî\ i]',-3866.67,3,0.00,'2026-10-29 00:00:00',0,2,48),(_binary '¢®å\ÍmC”És≤_\‹Fi',-4062.50,1,0.00,'2026-10-28 00:00:00',0,2,11),(_binary '§é\r¶=\√F)äà\œ\»:Ù\n',-1000.00,2,0.00,'2026-10-28 00:00:00',0,2,50),(_binary '§\Â”çe\nN\Ô∞:\∆\·:3\≈\’',-69.60,4,0.00,'2026-10-30 00:00:00',0,2,27),(_binary '•≤aíÚ@º±ÓöàpAÑ',-500.00,2,0.00,'2026-10-28 00:00:00',0,2,14),(_binary 'ßôo≥∑\ƒM˛¥„¥¥\…L',-966.67,3,0.00,'2026-10-29 00:00:00',0,2,3),(_binary '©)µÜBˇDïµîAk+∑fÖ',-2437.50,1,0.00,'2026-10-27 10:30:00',0,2,22),(_binary '™o\‰U˜BB≤¯-¨¡Å\Z',-5400.00,1,0.00,'2026-10-27 10:30:00',0,2,12),(_binary '™˙æ∏èaNÒï\–-™\◊X&\0',-580.00,7,0.00,'2026-11-02 00:00:00',0,2,18),(_binary '´î{SxA∂Cº\ÊÉ%\‰û',-1725.00,6,0.00,'2026-11-01 00:00:00',0,2,41),(_binary '≠vV\‚N\ﬂG\„ø<N\È\ÃÛ\”i',-966.67,2,0.00,'2026-10-28 00:00:00',0,2,2),(_binary '≠†∫k%J@◊ì≤\Ì\€M\'\÷\ﬁ',-600.00,5,0.00,'2026-10-31 00:00:00',0,2,5),(_binary '∞(™mD\ﬂO\Zénû}Àè#',-400.00,7,0.00,'2026-11-02 00:00:00',0,2,16),(_binary '∞ÖW\Î8@˙®Y\¬#¢Ω',-69.60,5,0.00,'2026-10-31 00:00:00',0,2,33),(_binary '∞\Ã\—zŸèC¶ÉKHöøN\”\…',-2437.50,1,0.00,'2026-10-28 00:00:00',0,2,20),(_binary '≤ZjáêL;®0mæò:•',-69.60,7,0.00,'2026-11-02 00:00:00',0,2,33),(_binary '¥§∏ùñKOeã\»S®^£',-966.67,4,0.00,'2026-10-30 00:00:00',0,2,6),(_binary '∂∫\‚/<B/®˚1\’o\Ó´',-3250.00,1,0.00,'2026-10-28 00:00:00',0,2,9),(_binary '∑n…Ø≠L«ø¢\Ô,5/\Ì',-1377.78,2,0.00,'2026-10-28 00:00:00',0,2,52),(_binary 'π•n\÷B\‡æ\ƒp{ZE\Î',-2066.67,7,0.00,'2026-11-02 00:00:00',0,2,35),(_binary '∫õ*pXBáô£¿L\‰K\»',-1256.67,5,0.00,'2026-10-31 00:00:00',0,2,25),(_binary 'ª\ÀNÉ†\‚Nÿº^\ÈÜ≠',-1000.00,6,0.00,'2026-11-01 00:00:00',0,2,50),(_binary 'º®(âÅlCeëaq\√PÑ',-966.67,7,0.00,'2026-11-02 00:00:00',0,2,2),(_binary 'º„∞™?Iq†nW¬ìFK\“',-1377.78,1,0.00,'2026-10-27 10:30:00',0,2,52),(_binary 'Ω%íè:≥Dˆû\„Øo)ã	',-966.67,6,0.00,'2026-11-01 00:00:00',0,2,15),(_binary 'Ω\\/o˜\◊Ae®)ï\ZMöæ',-696.00,1,0.00,'2026-10-27 10:30:00',0,2,38),(_binary 'ærˇT\√,Dïõï¨áeC\“{',-400.00,7,0.00,'2026-11-02 00:00:00',0,2,49),(_binary 'æveO\ËìBd™\n´\‡Fí',-696.00,4,0.00,'2026-10-30 00:00:00',0,2,31),(_binary 'øVOµ\Z6FóZÖ\›\Â\Ó´l',-1725.00,4,0.00,'2026-10-30 00:00:00',0,2,41),(_binary '¬ã\ÌÑøB$ûv\÷\ﬂ-ˆ2',-500.00,5,0.00,'2026-10-31 00:00:00',0,2,14),(_binary '\≈\rCL\Z6@¢õ`π:lé\≈F',-600.00,2,0.00,'2026-10-28 00:00:00',0,2,5),(_binary '\≈\›¯h\"πC7ìaûC|wt¯',-69.60,7,0.00,'2026-11-02 00:00:00',0,2,30),(_binary '\∆!!Ä=\·KØ¢ \÷3kz\‹',-966.67,1,0.00,'2026-10-27 10:30:00',0,2,3),(_binary '«ñ1ö\r∞M~∫He\Âçˆu',-2000.00,3,0.00,'2026-10-29 00:00:00',0,2,4),(_binary '\»\0\Œ*A\‰D/ú\«\‹9â\⁄oT',-5400.00,5,0.00,'2026-10-31 00:00:00',0,2,12),(_binary '\»Ü\ÌcOn§ µó\√$£2',-696.00,1,0.00,'2026-10-27 10:30:00',0,2,31),(_binary '…àé	E∂ãπd˛∞\œ5',-696.00,4,0.00,'2026-10-30 00:00:00',0,2,38),(_binary '\ \⁄@ì\ËAùq\∆èú',-2000.00,2,0.00,'2026-10-28 00:00:00',0,2,4),(_binary '\Ã(˙TF5®\0,£é´û',-1256.67,3,0.00,'2026-10-29 00:00:00',0,2,25),(_binary '\Ã\√\n\ )\ÀMaêª`ùd\ﬁ',-1933.33,7,0.00,'2026-11-02 00:00:00',0,2,26),(_binary '\Ã’¢…∂JS≥õ˙1vˇ∑7',-1725.00,2,0.00,'2026-10-28 00:00:00',0,2,41),(_binary 'Õæ≈øì@à£b,xáGì',-800.00,7,0.00,'2026-11-02 00:00:00',0,2,17),(_binary '\Õ\È\÷ßjC¢Çúahø\»z>',-500.00,4,0.00,'2026-10-30 00:00:00',0,2,14),(_binary '\Œ°f\‰N Äwx®QÑı\¬',-1256.67,4,0.00,'2026-10-30 00:00:00',0,2,25),(_binary '\Œ\«sä¯¯N\‚ßC¯h¶\'',-1800.00,5,0.00,'2026-10-31 00:00:00',0,2,40),(_binary '\–?˜ﬂë\œJï\Ã Ò¡∂',-800.00,4,0.00,'2026-10-30 00:00:00',0,2,17),(_binary '\—\Zê\«LOYêX’õÙÙã',-696.00,6,0.00,'2026-11-01 00:00:00',0,2,31),(_binary '—åÑ\›[QM≠[\ﬂ\rk|\»`',-69.60,7,0.00,'2026-11-02 00:00:00',0,2,27),(_binary '\”\Îe1dH•8πáÄŸ®Ö',-69.60,2,0.00,'2026-10-28 00:00:00',0,2,30),(_binary '\’\‰ãG\√O≤ä±µn\≈os\‰',-500.00,6,0.00,'2026-11-01 00:00:00',0,2,14),(_binary '\÷=\ﬂ¡Y¸Eò™ª\√∑\’z',-69.60,1,0.00,'2026-10-27 10:30:00',0,2,30),(_binary '\◊d\„˚êÛ@¥z\ÊπdΩ}û',-1933.33,2,0.00,'2026-10-28 00:00:00',0,2,26),(_binary '◊áTÜ\ÁbMp•\‰\n;\…gj\Ì',-1000.00,5,0.00,'2026-10-31 00:00:00',0,2,50),(_binary '\ÿ\ÍDµ¯\’G}®ïQ\Á\—\0ä',-696.00,7,0.00,'2026-11-02 00:00:00',0,2,31),(_binary 'ŸÖ8dÉI\Ó®Iºªhæ5',-800.00,5,0.00,'2026-10-31 00:00:00',0,2,17),(_binary '\⁄t\÷\ÕÄJaå≠ìÉ\·\0\ƒ',-600.00,4,0.00,'2026-10-30 00:00:00',0,2,5),(_binary '\‹I\Z◊ùõI™Ø\Â˛S',-580.00,4,0.00,'2026-10-30 00:00:00',0,2,18),(_binary '›¢Ûj7G@ø\Á2Äp\0è',-400.00,6,0.00,'2026-11-01 00:00:00',0,2,16),(_binary '\ﬁÍÖì,ÙGM∑õ´aΩhé',-400.00,1,0.00,'2026-10-27 10:30:00',0,2,16),(_binary '\·\—ﬁö‹õ@\·±\◊+°FèÆ',-400.00,5,0.00,'2026-10-31 00:00:00',0,2,49),(_binary '\‚æ:•@\ÈDÃíUõ;˝∏\r9',-1800.00,3,0.00,'2026-10-29 00:00:00',0,2,40),(_binary '„¨≥.)§I«ΩT\ﬁ\"]°r',-69.60,6,0.00,'2026-11-01 00:00:00',0,2,27),(_binary '\‰K6\\FÄ∞Wi\ƒL@ø',-1933.33,4,0.00,'2026-10-30 00:00:00',0,2,26),(_binary '\‰g˙>˙ÅCÖ†§[wß,˝k',-2900.00,1,0.00,'2026-10-28 00:00:00',0,2,51),(_binary '\Â;óÄ§ÅB\Ïà—ì_∞∏\⁄P',-1256.67,7,0.00,'2026-11-02 00:00:00',0,2,25),(_binary '\Â\»\\d/Lr•4ùˆµ€±Ä',-400.00,3,0.00,'2026-10-29 00:00:00',0,2,16),(_binary '\Ê\¬\ÏA\ËóKÖé…£;ÚÚΩm',-400.00,5,0.00,'2026-10-31 00:00:00',0,2,16),(_binary '\Á\ÕiH\ JIıáı•K;J #',-580.00,1,0.00,'2026-10-27 10:30:00',0,2,18),(_binary 'Ë±ûâˇ3BÃ∫	^\Ô2ü',-69.60,6,0.00,'2026-11-01 00:00:00',0,2,28),(_binary '\Ë\ƒÛ|MYíîyG\ﬂ\Á‹â',-1256.67,2,0.00,'2026-10-28 00:00:00',0,2,25),(_binary '\Ë\…\ﬁ\ÃreJÿÇp,òˆEØ',-966.67,5,0.00,'2026-10-31 00:00:00',0,2,2),(_binary '\Í\Z†Ú†J7∞5zYâ\ﬂh',-696.00,7,0.00,'2026-11-02 00:00:00',0,2,37),(_binary 'ÎÇ¢l46@Fè<zÛ˙h',-1377.78,7,0.00,'2026-11-02 00:00:00',0,2,52),(_binary '\ÏQDÂºÇN™æáÆeôÄd]',-966.67,2,0.00,'2026-10-28 00:00:00',0,2,3),(_binary 'Óãî£YÄL£\\∞ô\'Iß',-600.00,1,0.00,'2026-10-27 10:30:00',0,2,5),(_binary 'Ú≠}¶•GAì0ﬁéKˆ8',-3168.75,1,0.00,'2026-10-28 00:00:00',0,2,32),(_binary 'ÛV’™x\·L≠¨ÅD˜\◊D:ì',-69.60,3,0.00,'2026-10-29 00:00:00',0,2,30),(_binary 'Ùe≠ ö\÷G£ó˚\ \'_Ø',-2066.67,6,0.00,'2026-11-01 00:00:00',0,2,35),(_binary 'ıˆ|*N\›CdÉˆr\ÿ\„(\\',-69.60,2,0.00,'2026-10-28 00:00:00',0,2,28),(_binary '˜@Q±D3ç¬êŸÑ,w',-1800.00,4,0.00,'2026-10-30 00:00:00',0,2,40),(_binary '¯§e∂\„H™ÅÅÙb\0!',-400.00,4,0.00,'2026-10-30 00:00:00',0,2,49),(_binary '¯“≤ä JZ∑õΩ˝)SF',-966.67,4,0.00,'2026-10-30 00:00:00',0,2,2),(_binary '¯m\›~\Ô>Nqö*\"\Ï=î+?',-2066.67,4,0.00,'2026-10-30 00:00:00',0,2,35),(_binary '˙3	\—ˇN–¥ç\Ëﬁær\‘\⁄',-2066.67,3,0.00,'2026-10-29 00:00:00',0,2,35),(_binary '¸C9}|Hõ?\'\ÿ\…=9',-69.60,5,0.00,'2026-10-31 00:00:00',0,2,28),(_binary '˝\ﬁ\ >N9ò\Ï\Î\⁄\¬F',-966.67,6,0.00,'2026-11-01 00:00:00',0,2,3),(_binary '˝\Â$6é\ÔI\'≤0aØ\÷sBÆ',-1933.33,3,0.00,'2026-10-29 00:00:00',0,2,26),(_binary '˛o®K≥5B¿∫G˜øPQKå',-1625.00,1,0.00,'2026-10-28 00:00:00',0,2,19),(_binary 'ˇ\√Eo˙VFYºtÜ\”∫5¨',-41.40,4,0.00,'2026-10-30 00:00:00',0,2,36);
/*!40000 ALTER TABLE `daily_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_status` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `basic_salary` decimal(12,2) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `nic` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) NOT NULL,
  `update_status` bigint DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `deleted` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj9xgmd0ya5jmus09o0b8pqrpb` (`email`),
  KEY `FKah490190ww1q2a4piuv41hk6e` (`role_id`),
  KEY `FKialhyfka8wy8ljopxkstd1xcr` (`updated_by`),
  KEY `FK4xxve990vv5nd2qbdj4i6m21h` (`created_by`),
  CONSTRAINT `FK4xxve990vv5nd2qbdj4i6m21h` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKah490190ww1q2a4piuv41hk6e` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKialhyfka8wy8ljopxkstd1xcr` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Active','Galle Rd, Kalutara',35000.00,'chirath@email.com','Chirath','Wijesinghe','200245879365','$2a$10$hnulUx0KuOvWoBp7go72xuAeFWOwpO7BPVvNCVM0B3CJSppx8vlpe','0786268640',1,3,NULL,NULL,_binary '\0'),(2,'Active','Horana Rd, Panadura',0.00,'admin@email.com','System','Administrator','200138796547','$2a$10$DkPN6oCONeGIKWqUs3JbbuXPGUQjV4M/UGWyXMsGurqF2qNc.uEcO','0342251678',7,1,2,NULL,_binary '\0'),(3,'Active','Default',34000.00,'vihaga@email.com','Vihaga','Yasitha','1545266145','$2a$10$hnulUx0KuOvWoBp7go72xuAeFWOwpO7BPVvNCVM0B3CJSppx8vlpe','0786265689',12,2,3,NULL,_binary '\0'),(20,'Active','Default',0.00,'shanu@email.com','pasindu','shanuka','200227900604','$2a$10$WYpj0/6/aadMYDFPBGGYrui1WY6Pcwp5bm.KtNQSmrJl4dy5NHwjy','0762443878',2,2,20,NULL,_binary '\0'),(33,'Deleted','paradise kuruwitt',0.00,'pasi@email.com','pasindu','sgamalath','200227900607','$2a$10$fF.u6C9HC6Q42h8dbbTw/.aRaB.kOXNyChbRhyyWkD399Ju.UK3WC','0763452534',4,2,33,NULL,_binary ''),(36,'Active','Default',27000.00,'deraniyagala2026@gmail.com','Lechcheman','Kanageshwaran','200210801499','$2a$10$vaaa7g1qzIQ13uhUjm5CzuIUcv/3FegCyh4178p3J8HYmgMx636Re','0768222143',4,2,36,NULL,_binary '\0'),(37,'Deleted','Default',27000.00,'dalugoda19@gmail.com','kumudu','dalugoda','198827603943','$2a$10$cx5bSkoJYvX3RONffOF2N.IyBuD6g7V/KMrAW3fvFqtXcGDoyLqk.','0767316872',5,2,43,NULL,_binary ''),(39,'Active','Default',27000.00,'lankacapitaloffice@gmail.com','nimasha','nanayakkara','997973208v','$2a$10$gmSk3G9kbdWaxoCQFcxDhedLKCTXdaobOT1HysHCvpb2wD9GO3Di6','0765522141',3,2,2,NULL,_binary '\0'),(40,'Deleted','Default',30000.00,'bhathiya@gmail.com','Pasindu','Bhathiya','200208800900','$2a$10$VFxA8pkfnbNnsWJ5uCfwKO6zXZRo8p9O/9f5W2JBRTX5mJSGp/vgm','0786379640',1,3,2,NULL,_binary ''),(43,'Active','Default',27000.00,'lankacapital5@gmail.com','Kumudu','Dalugoda','882763943V','$2a$10$UPlsTK0.n3ytpj6OPzf7.uf.pDXK6CuUxnew2zNErqfm1scKHLt32','0762802191',2,1,2,NULL,_binary '\0'),(44,'Active','Kuruwita, Rathnapura',27000.00,'emrskekanayaka91@gmail.com','Kantha','Ekanayaka','915142052V','$2a$10$7r2Mb8Z3fkwsUrF50OOfJODVLljZ8zicqTlPIdQzVs.rqAYOy.WYq','0767069105',2,2,44,NULL,_binary '\0'),(45,'Active','Default',27000.00,'kuruwita2026@gmail.com','Sahan','Ransara','200230900649','$2a$10$PnBWtz58FGfaSGSFKRxpmO9ZwUzF6xwudIx4oXvcn5narqZUaAjDK','0773622143',1,2,43,NULL,_binary '\0'),(46,'Active','Default',27000.00,'erathna2026@gmail.com','upul','prasad','198427102700','$2a$10$FBXTDS2ymcUXR7Yiq.d6quFEfGcX.4PjKGsMlum68RRUkrWL7gHd.','0772612143',1,2,43,NULL,_binary '\0'),(47,'Active','Default',30000.00,'janaka1666@gmail.com','Ravindra','Senarath','833553712v ','$2a$10$ScVCUgloxYwuRk3RwVx3cOlF.9AG7ZzQ07PEDLp3OcRPZmD03gEP.','0765409045',1,3,43,NULL,_binary '\0'),(48,'Active','Default',30000.00,'nilnkaaruna@gmai.com','Nilanka','Aruna','198308400176','$2a$10$RY/zOwQGTGPpwwrOTb6C0OcEykqEBl/Y8ej64nezZZyuYut1qNDe6','0743050322',2,3,43,NULL,_binary '\0'),(50,'Active','Default',27000.00,'sksynergy2025@gmail.com','Kantha','Dalugoda','198827603900','$2a$10$/55JMKsV9mXhQuFmHzBrh.r4hGMFX4Wuitp2xPMxhf489Znzf1TSK','0767316872',1,3,43,NULL,_binary '\0'),(51,'Active','Default',27000.00,'sanjaya.kumara13@gmail.com','Sanjaya','Kumara','198516503600','$2a$10$cSd2dnfQqOkOtSuWAKHb5OeiWfBHdvrnF5YMYxKD.Yh9EkLMXHqWO','0769978320',2,3,43,NULL,_binary '\0');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equity_change`
--

DROP TABLE IF EXISTS `equity_change`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equity_change` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_name` varchar(255) DEFAULT NULL,
  `financial_date` date DEFAULT NULL,
  `retained_earning_amount` decimal(38,2) DEFAULT NULL,
  `stated_capital_amount` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equity_change`
--

LOCK TABLES `equity_change` WRITE;
/*!40000 ALTER TABLE `equity_change` DISABLE KEYS */;
INSERT INTO `equity_change` VALUES (1,'Balance as at 01st April 2024','2027-03-31',10000.00,100000.00),(2,'Shares Issued','2027-03-31',2000.00,NULL),(3,'Profit or Loss for the Period','2027-03-31',NULL,500000.00);
/*!40000 ALTER TABLE `equity_change` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_note_data`
--

DROP TABLE IF EXISTS `financial_note_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_note_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `balance_at_date` date DEFAULT NULL,
  `depreciation_balance` decimal(38,2) DEFAULT NULL,
  `financial_date` date DEFAULT NULL,
  `opening_balance` decimal(38,2) DEFAULT NULL,
  `asset` bigint DEFAULT NULL,
  `years` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKignu5140gqegfkh9hj8ttc5mo` (`asset`),
  CONSTRAINT `FKignu5140gqegfkh9hj8ttc5mo` FOREIGN KEY (`asset`) REFERENCES `assets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_note_data`
--

LOCK TABLES `financial_note_data` WRITE;
/*!40000 ALTER TABLE `financial_note_data` DISABLE KEYS */;
INSERT INTO `financial_note_data` VALUES (6,'2026-04-01',29900.00,'2027-03-31',160000.00,1,5),(7,'2026-04-01',1000.00,'2027-03-31',5000.00,2,5),(8,'2026-04-01',6300.00,'2027-03-31',40000.00,3,5),(9,'2026-04-01',16000.00,'2027-03-31',90000.00,6,5),(10,'2026-04-01',7000.00,'2027-03-31',38000.00,9,5),(11,'2026-04-01',4300.00,'2027-03-31',25000.00,10,5);
/*!40000 ALTER TABLE `financial_note_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_tax`
--

DROP TABLE IF EXISTS `income_tax`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_tax` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `balancebfamount` decimal(38,2) DEFAULT NULL,
  `balancebfdate` date DEFAULT NULL,
  `business_income` decimal(38,2) DEFAULT NULL,
  `financial_date` date DEFAULT NULL,
  `investment_income` decimal(38,2) DEFAULT NULL,
  `withholding_amount` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_tax`
--

LOCK TABLES `income_tax` WRITE;
/*!40000 ALTER TABLE `income_tax` DISABLE KEYS */;
INSERT INTO `income_tax` VALUES (1,120000.00,'2026-04-01',140000.00,'2027-03-31',150000.00,500000.00);
/*!40000 ALTER TABLE `income_tax` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `decision_note` varchar(1000) DEFAULT NULL,
  `document_charge` decimal(12,2) DEFAULT NULL,
  `end_at` date DEFAULT NULL,
  `file_number` varchar(255) DEFAULT NULL,
  `installment` int DEFAULT NULL,
  `interest_rate` double DEFAULT NULL,
  `loan_type` enum('DAILY','WEEKLY') DEFAULT NULL,
  `status` enum('APPROVED','COMPLETED','PENDING','REJECTED') DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `risk` enum('HIGH','LOW','MEDIUM') DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKio7j896k1ibvl69l7nikgnagi` (`file_number`),
  KEY `FK8n8lir443u7ns6t95u972b9y7` (`approved_by`),
  KEY `FK5sbankaox125wi206qli4jfom` (`created_by`),
  KEY `FK3s60kbg0a404doyf8ii6qwb9g` (`customer_id`),
  KEY `FKt4le8gcsh347e5kvjivp9o6qy` (`updated_by`),
  CONSTRAINT `FK3s60kbg0a404doyf8ii6qwb9g` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`nic`),
  CONSTRAINT `FK5sbankaox125wi206qli4jfom` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK8n8lir443u7ns6t95u972b9y7` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKt4le8gcsh347e5kvjivp9o6qy` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (1,75000.00,'2026-08-15 13:00:45','',100.00,'2026-10-15','LCK001',60,16,'DAILY','REJECTED',1,NULL,1,'915142052V',2,NULL,'2026-09-30 16:22:29'),(2,50000.00,'2026-08-15 13:09:04','',100.00,'2026-10-11','LCK124',60,16,'DAILY','APPROVED',4,2,39,'196033600206',NULL,NULL,'2026-09-29 16:22:29'),(3,50000.00,'2026-08-15 13:12:29','D/C Pending',0.00,'2026-10-13','LCK125',60,16,'DAILY','APPROVED',2,2,39,'196381902810',NULL,NULL,'2026-10-03 16:22:29'),(4,50000.00,'2026-08-15 13:16:02','',100.00,'2026-09-12','LCK127',30,20,'DAILY','APPROVED',2,2,39,'790100522v',NULL,NULL,'2026-10-03 16:22:29'),(5,30000.00,'2026-08-15 17:30:35','',100.00,'2026-10-02','LCK120',60,20,'DAILY','APPROVED',3,2,39,'781604453v',NULL,NULL,'2026-09-30 16:22:29'),(6,50000.00,'2026-08-15 17:34:13','',100.00,'2026-10-09','LCK121',60,16,'DAILY','APPROVED',1,2,39,'196934100827',NULL,NULL,'2026-09-30 16:22:29'),(7,15000.00,'2026-08-16 06:00:16','',100.00,NULL,'lck130',8,21,'WEEKLY','COMPLETED',4,43,37,'882763943v',1,NULL,'2026-09-30 16:22:29'),(8,10000.00,'2026-08-16 06:03:01','',100.00,NULL,'WD697',8,30,'WEEKLY','COMPLETED',5,2,37,'882763940V',1,NULL,'2026-09-30 16:22:29'),(9,20000.00,'2026-08-16 06:03:40','',100.00,NULL,'WD698',8,30,'WEEKLY','APPROVED',3,2,39,'878115503V',1,NULL,'2026-09-23 16:22:29'),(10,10000.00,'2026-08-16 06:04:01','',100.00,NULL,'WE699',8,30,'WEEKLY','APPROVED',4,43,37,'882060943v',1,NULL,'2026-09-23 16:22:29'),(11,25000.00,'2026-08-16 06:07:01','',100.00,NULL,'WD700',8,30,'WEEKLY','APPROVED',3,43,37,'123456789123',1,NULL,'2026-09-30 16:22:29'),(12,150000.00,'2026-08-20 08:55:00','',100.00,'2026-09-15','LCK128',30,8,'DAILY','APPROVED',4,43,1,'833381199V',NULL,NULL,'2026-09-30 16:22:29'),(13,75000.00,'2026-08-22 14:54:56','',100.00,NULL,'WD696',8,30,'WEEKLY','APPROVED',3,43,44,'197981303667',1,NULL,'2026-09-30 16:22:29'),(14,25000.00,'2026-08-22 15:28:52','',100.00,NULL,'LCK131',60,20,'DAILY','APPROVED',2,43,44,'790100522v',1,NULL,'2026-09-30 16:22:29'),(15,50000.00,'2026-08-23 05:44:02','',100.00,NULL,'LCK132',60,16,'DAILY','APPROVED',3,43,45,'781604453v',1,NULL,'2026-09-30 16:22:29'),(16,20000.00,'2026-08-23 05:52:06','',100.00,NULL,'LCK134',60,20,'DAILY','APPROVED',2,43,44,'882901826v',1,NULL,'2026-09-30 16:22:29'),(17,20000.00,'2026-08-23 05:52:42','',100.00,NULL,'LCK133',30,20,'DAILY','APPROVED',5,43,46,'198405804410',1,NULL,'2026-09-30 16:22:29'),(18,30000.00,'2026-08-23 05:53:13','',100.00,NULL,'LCK129',60,16,'DAILY','APPROVED',3,2,45,'196386401178',1,NULL,'2026-09-30 16:22:29'),(19,10000.00,'2026-08-27 19:56:55','',100.00,'2026-10-27','WE701',8,30,'WEEKLY','APPROVED',2,43,1,'852301520V',NULL,NULL,'2026-09-30 16:22:29'),(20,15000.00,'2026-08-27 20:02:55','Collect ID Copy and Bank statement ',100.00,'2026-10-27','WE702',8,30,'WEEKLY','APPROVED',2,43,1,'816 533 449V',NULL,NULL,'2026-09-30 16:22:29'),(21,10000.00,'2026-08-27 20:07:53','CHECK OLD LOAN RECOVERY ',100.00,'2026-10-27','WE703',8,30,'WEEKLY','APPROVED',4,43,1,'197 632 501 144',NULL,NULL,'2026-09-30 16:22:29'),(22,15000.00,'2026-08-27 20:09:55','',100.00,'2026-10-27','WD704',8,30,'DAILY','APPROVED',1,43,1,'913 043 901V',NULL,NULL,'2026-09-30 16:22:29'),(23,5000.00,'2026-08-27 20:11:47','',100.00,'2026-09-27','WD705',4,30,'WEEKLY','APPROVED',1,43,1,'196 754 802 560',NULL,NULL,'2026-09-30 16:22:29'),(24,15000.00,'2026-08-27 20:15:20','',100.00,'2026-10-27','WD709',8,30,'WEEKLY','APPROVED',2,43,1,'198 609 003 202',43,NULL,'2026-09-30 16:22:29'),(25,65000.00,'2026-08-28 05:46:51','',100.00,NULL,'LCE262',60,16,'DAILY','APPROVED',4,43,44,'198230900085',1,NULL,'2026-09-30 16:22:29'),(26,100000.00,'2026-08-28 05:54:10','',100.00,NULL,'LCD145',60,16,'DAILY','APPROVED',4,43,36,'198231900085',1,NULL,'2026-09-30 16:22:29'),(27,72000.00,'2026-08-28 05:54:23','',100.00,NULL,'LCK139',1200,16,'DAILY','APPROVED',2,43,45,'197222003410',1,NULL,'2026-09-30 16:22:29'),(28,18000.00,'2026-08-28 06:00:05','',100.00,NULL,'LCK140',300,16,'DAILY','APPROVED',3,43,45,'761380729v',1,NULL,'2026-09-30 16:22:29'),(29,39000.00,'2026-08-28 06:07:15','',100.00,NULL,'LCD135',8,30,'WEEKLY','APPROVED',2,43,36,'200002110119',1,NULL,'2026-09-30 16:22:29'),(30,87000.00,'2026-08-28 06:15:22','',100.00,NULL,'LCK143',1450,16,'DAILY','APPROVED',3,43,45,'680492611v',1,NULL,'2026-09-30 16:22:29'),(31,36000.00,'2026-08-28 06:23:49','',100.00,NULL,'LCD137',60,16,'DAILY','APPROVED',3,43,36,'655532153V',1,NULL,'2026-09-30 16:22:29'),(32,19500.00,'2026-08-28 06:51:56','',100.00,NULL,'LCD139',8,30,'WEEKLY','APPROVED',3,43,36,'198609003202',1,NULL,'2026-09-30 16:22:29'),(33,69600.00,'2026-08-28 06:53:54','',100.00,NULL,'LCE263',1160,16,'DAILY','APPROVED',4,43,46,'842871018v',1,NULL,'2026-09-30 16:22:29'),(34,36000.00,'2026-08-28 06:57:33','',100.00,NULL,'LCD140',60,16,'DAILY','APPROVED',3,43,36,'199502602320',1,NULL,'2026-09-30 16:22:29'),(35,150000.00,'2026-08-28 09:27:00','',100.00,'2026-11-24','LCK138',90,24,'DAILY','APPROVED',1,43,1,'680544611V',NULL,NULL,'2026-09-30 16:22:29'),(36,58000.00,'2026-08-28 09:52:11','',100.00,NULL,'LCK142',1625,16,'DAILY','APPROVED',3,43,46,'886283245v',1,NULL,'2026-09-30 16:22:29'),(37,36000.00,'2026-08-29 06:51:50','',100.00,NULL,'LCD141',60,16,'DAILY','APPROVED',6,43,36,'655531153',1,NULL,'2026-09-30 16:22:29'),(38,36000.00,'2026-08-29 06:52:16','',100.00,NULL,'LCD138',60,16,'DAILY','APPROVED',2,43,36,'655531153V',1,NULL,'2026-09-30 16:22:29'),(39,19500.00,'2026-08-29 06:55:42','',100.00,NULL,'LCD136',8,30,'WEEKLY','APPROVED',2,43,36,'926424874V',1,NULL,'2026-09-30 16:22:29'),(40,50000.00,'2026-08-26 13:16:51','',100.00,'2026-10-29','D001',30,8,'DAILY','APPROVED',1,2,1,'200227800588',NULL,NULL,'2026-09-30 16:22:29'),(41,45000.00,'2026-08-30 00:07:42','',100.00,'2026-09-29','D002',30,15,'DAILY','APPROVED',2,43,2,'200227800588',1,NULL,'2026-09-30 16:22:29'),(42,174000.00,'2026-08-30 05:26:34',NULL,0.00,NULL,'d4bbf965-bf13-4e62-81a4-6e961ad3c6af',60,0,'DAILY','PENDING',0,NULL,36,'865783230V',NULL,NULL,'2026-09-30 16:22:29'),(43,50000.00,'2026-08-30 05:38:55',NULL,0.00,NULL,'e38424db-0597-4149-9fab-22812c5acfba',967,0,'DAILY','PENDING',0,NULL,46,'199860900320',NULL,NULL,'2026-09-30 16:22:29'),(44,12075.00,'2026-08-30 05:38:58',NULL,0.00,NULL,'0785161f-27e3-44f8-8b91-86e5dca25535',4,0,'WEEKLY','PENDING',0,NULL,36,'741835550v',NULL,NULL,'2026-09-30 16:22:29'),(45,116000.00,'2026-08-30 05:39:21',NULL,0.00,NULL,'ac22faa7-9f40-4d93-b28f-8d9de7f85006',60,0,'DAILY','PENDING',0,NULL,45,'660123849v',NULL,NULL,'2026-09-30 16:22:29'),(46,50000.00,'2026-08-30 05:41:29',NULL,0.00,NULL,'2dadacfa-7cb3-4742-a70a-f7514e8fe725',8125,0,'WEEKLY','PENDING',0,NULL,46,'198230990085',NULL,NULL,'2026-09-30 16:22:29'),(47,35000.00,'2026-08-30 05:42:01',NULL,0.00,NULL,'7d98779e-c153-4d3e-944f-9b83c401a053',60,0,'DAILY','PENDING',0,NULL,36,'926424874V',NULL,NULL,'2026-09-30 16:22:29'),(48,100000.00,'2026-08-30 05:43:24','',100.00,NULL,'LCD1 61',30,16,'DAILY','APPROVED',2,43,36,'123540120567',1,NULL,'2026-09-30 16:22:29'),(49,20000.00,'2026-08-30 05:43:25','',100.00,NULL,'LCK148',60,20,'DAILY','APPROVED',3,43,45,'761380729v',1,NULL,'2026-09-30 16:22:29'),(50,50000.00,'2026-08-30 05:50:07','',100.00,NULL,'LCE101',60,20,'DAILY','APPROVED',2,43,45,'197222003410',1,NULL,'2026-09-30 16:22:29'),(51,20000.00,'2026-08-30 05:59:12','',100.00,NULL,'WE120',8,16,'WEEKLY','APPROVED',3,43,46,'882763943v',1,NULL,'2026-09-30 16:22:29'),(52,100000.00,'2026-08-30 06:01:05','',100.00,NULL,'LCE100',90,24,'DAILY','APPROVED',2,43,46,'198527102700',1,NULL,'2026-09-30 16:22:29'),(53,50000.00,'2026-08-30 06:57:02','Collect ID card copy',100.00,NULL,'LCD150',60,16,'DAILY','COMPLETED',6,43,39,'680492611v',1,NULL,'2026-09-30 16:22:29'),(54,10000.00,'2026-08-30 07:39:08','',100.00,'2026-10-30','WE710',8,30,'WEEKLY','COMPLETED',4,43,1,'768462402V',NULL,NULL,'2026-09-30 16:22:29'),(55,50000.00,'2026-08-30 09:37:25',NULL,0.00,NULL,'f4be4c6c-1775-4c26-988a-ba63bd70326d',60,0,'DAILY','PENDING',0,NULL,36,'197686502651',NULL,NULL,'2026-09-30 16:22:29'),(56,50000.00,'2026-08-30 09:38:40',NULL,0.00,NULL,'ca0c7b2f-c9dc-4f61-a755-ae7295d4b0af',60,0,'DAILY','PENDING',0,NULL,36,'197686502651',NULL,NULL,'2026-09-30 16:22:29'),(57,100000.00,'2026-09-12 09:15:05',NULL,0.00,NULL,'03510c46-9f07-4374-af56-1d098837eb1b',60,0,'DAILY','PENDING',0,NULL,39,'660123849v',NULL,NULL,'2026-09-30 16:22:29'),(58,75000.00,'2026-09-12 09:30:39',NULL,0.00,NULL,'21a7b930-bbf9-4f37-95bd-fb673693845d',60,0,'DAILY','PENDING',0,NULL,39,'680492611v',NULL,NULL,'2026-09-30 16:22:29'),(59,75000.00,'2026-09-12 09:32:26',NULL,0.00,NULL,'20625538-6fcd-4d0d-8883-5e3ab09c244e',60,0,'DAILY','PENDING',0,NULL,39,'886283245v',NULL,NULL,'2026-09-30 16:22:29'),(60,30000.00,'2026-09-15 08:29:39',NULL,0.00,NULL,'e15728b7-ca7b-488e-aefc-98e5ebe4441b',8,0,'WEEKLY','PENDING',0,NULL,39,'198609003202',NULL,NULL,'2026-09-30 16:22:29'),(61,80000.00,'2026-09-15 08:32:27',NULL,0.00,NULL,'23909299-ad7b-4218-a177-f455e0a7dc04',60,0,'DAILY','PENDING',0,NULL,39,'842871018v',NULL,NULL,'2026-09-30 16:22:29'),(62,30000.00,'2026-09-15 08:36:33',NULL,0.00,NULL,'d979c0b6-4f35-46c6-835f-fe49aeeaaea7',8,0,'WEEKLY','PENDING',0,NULL,39,'667557442V',NULL,NULL,'2026-09-30 16:22:29'),(63,25000.00,'2026-09-15 08:42:52',NULL,0.00,NULL,'1ac95c8f-8dd7-4d36-9896-6514cd06e320',8,0,'WEEKLY','PENDING',0,NULL,39,'841413210V',NULL,NULL,'2026-09-30 16:22:29'),(64,25000.00,'2026-10-01 05:52:47',NULL,0.00,NULL,'06247bfb-11f2-4fb8-9c84-7db8a1c86ad6',60,0,'DAILY','PENDING',0,NULL,39,'197617801499',NULL,NULL,'2026-10-01 05:52:47'),(65,25000.00,'2026-10-01 06:04:26',NULL,0.00,NULL,'cd2c6218-29dd-412d-9366-49b9207c65b4',60,0,'DAILY','PENDING',0,NULL,36,'720630940V',NULL,NULL,'2026-10-01 06:04:26');
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_expenses`
--

DROP TABLE IF EXISTS `monthly_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `building_rent` decimal(12,2) DEFAULT NULL,
  `electricity_bill` decimal(12,2) DEFAULT NULL,
  `fuel_allowance` decimal(12,2) DEFAULT NULL,
  `month` varchar(255) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `other_expenses` decimal(12,2) DEFAULT NULL,
  `request` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `router_bill` decimal(12,2) DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `telephone_bill` decimal(12,2) DEFAULT NULL,
  `total_expenses` decimal(14,2) DEFAULT NULL,
  `vehicle_allowance_and_travel` decimal(12,2) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmhx3mw42oi9q8nj7r7j2unreb` (`month`),
  KEY `FKk542g8rkxw1mej20elme4ruuk` (`employee_id`),
  KEY `FK9hyj9d5ljhdm2kamujjukswss` (`approved_by`),
  CONSTRAINT `FK9hyj9d5ljhdm2kamujjukswss` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKk542g8rkxw1mej20elme4ruuk` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_expenses`
--

LOCK TABLES `monthly_expenses` WRITE;
/*!40000 ALTER TABLE `monthly_expenses` DISABLE KEYS */;
INSERT INTO `monthly_expenses` VALUES (1,17000.00,3500.00,48000.00,'2026-08','Monthly expence',75000.00,'PENDING',1700.00,0.00,5000.00,175200.00,25000.00,1,0,NULL);
/*!40000 ALTER TABLE `monthly_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_income`
--

DROP TABLE IF EXISTS `monthly_income`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_income` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `loan_interest` decimal(38,2) DEFAULT NULL,
  `month` varchar(255) DEFAULT NULL,
  `other_income` decimal(38,2) DEFAULT NULL,
  `registration_fees` decimal(38,2) DEFAULT NULL,
  `total_income` decimal(38,2) DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqwrbosi3p8oy5ybokuxq8e64q` (`employee_id`),
  CONSTRAINT `FKqwrbosi3p8oy5ybokuxq8e64q` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_income`
--

LOCK TABLES `monthly_income` WRITE;
/*!40000 ALTER TABLE `monthly_income` DISABLE KEYS */;
/*!40000 ALTER TABLE `monthly_income` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_shares_data`
--

DROP TABLE IF EXISTS `note_shares_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_shares_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `financial_date` date DEFAULT NULL,
  `number_of_shares` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_shares_data`
--

LOCK TABLES `note_shares_data` WRITE;
/*!40000 ALTER TABLE `note_shares_data` DISABLE KEYS */;
INSERT INTO `note_shares_data` VALUES (1,'2027-03-31',6);
/*!40000 ALTER TABLE `note_shares_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petty_cash`
--

DROP TABLE IF EXISTS `petty_cash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `petty_cash` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `date_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `narration` varchar(255) DEFAULT NULL,
  `request` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `requested_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKri1a0yssh8mcoqkuwspqj6913` (`approved_by`),
  KEY `FKpu958oj4sa6v8cbt4b3pq29dp` (`category_id`),
  KEY `FKn7838n4jvd1rq42k4rbr399ul` (`requested_by`),
  KEY `FK39nruri22gucfax13ghgl3jmi` (`updated_by`),
  CONSTRAINT `FK39nruri22gucfax13ghgl3jmi` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKn7838n4jvd1rq42k4rbr399ul` FOREIGN KEY (`requested_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKpu958oj4sa6v8cbt4b3pq29dp` FOREIGN KEY (`category_id`) REFERENCES `petty_cash_category` (`id`),
  CONSTRAINT `FKri1a0yssh8mcoqkuwspqj6913` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petty_cash`
--

LOCK TABLES `petty_cash` WRITE;
/*!40000 ALTER TABLE `petty_cash` DISABLE KEYS */;
INSERT INTO `petty_cash` VALUES (1,99975.00,'2026-05-03 23:16:20','Advertisements','APPROVED',0,2,1,1,1),(2,163480.00,'2026-05-03 23:16:20','bad debts','APPROVED',0,2,2,1,2),(3,11000.00,'2026-05-03 23:16:20','commission','APPROVED',0,2,8,1,1),(4,900750.00,'2026-05-03 23:16:20','salary','APPROVED',0,2,9,1,2),(5,16522.00,'2026-05-03 23:16:20','epf-etf','APPROVED',0,2,10,1,2),(6,171150.00,'2026-05-03 23:16:20','rent','APPROVED',0,43,11,1,2),(7,71672.50,'2026-05-03 23:16:20','maintainance-repair','APPROVED',0,2,12,1,2),(8,13070.00,'2026-05-03 23:16:20','electricity','APPROVED',0,2,13,1,2),(9,45597.00,'2026-05-03 23:16:20','phone-internet-bill','APPROVED',0,2,14,1,2),(10,60000.00,'2026-05-03 23:16:20','comp-inc-fee','APPROVED',0,2,15,1,2),(11,10500.00,'2026-05-03 23:16:20','insurance','APPROVED',0,2,16,1,2),(12,94812.00,'2026-05-03 23:16:20','stationary-documents','APPROVED',0,2,17,1,2);
/*!40000 ALTER TABLE `petty_cash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petty_cash_category`
--

DROP TABLE IF EXISTS `petty_cash_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `petty_cash_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcx0ibrxdhnmq83s2a8mceofiq` (`created_by`),
  CONSTRAINT `FKcx0ibrxdhnmq83s2a8mceofiq` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petty_cash_category`
--

LOCK TABLES `petty_cash_category` WRITE;
/*!40000 ALTER TABLE `petty_cash_category` DISABLE KEYS */;
INSERT INTO `petty_cash_category` VALUES (1,'Advertisment & Sales Promotion',2),(2,'Bad Debts',2),(8,'Commission',2),(9,'Salaries & Wages',2),(10,'EPF & Etf',2),(11,'Rent',2),(12,'Maintance & Repair',2),(13,'Electricity',2),(14,'Phone & Internet bills ',2),(15,'Company Incorporation fees',2),(16,'Insurance',2),(17,'Stationery & Documents',2);
/*!40000 ALTER TABLE `petty_cash_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN',NULL),(2,'FO',NULL),(3,'RECEPTIONIST',NULL),(4,'CUSTOMER',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salaries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attendance` decimal(12,2) DEFAULT NULL,
  `companyepf` decimal(12,2) DEFAULT NULL,
  `companyetf` decimal(12,2) DEFAULT NULL,
  `employeeepf` decimal(12,2) DEFAULT NULL,
  `gross_salary` decimal(12,2) DEFAULT NULL,
  `incentive` decimal(12,2) DEFAULT NULL,
  `loans` decimal(12,2) DEFAULT NULL,
  `month` varchar(255) NOT NULL,
  `net_salary` decimal(12,2) DEFAULT NULL,
  `ot_amount` decimal(12,2) DEFAULT NULL,
  `ot_hours` double DEFAULT NULL,
  `salary_advance` decimal(12,2) DEFAULT NULL,
  `sales` decimal(12,2) DEFAULT NULL,
  `total_deduction` decimal(12,2) DEFAULT NULL,
  `total_salary` decimal(12,2) DEFAULT NULL,
  `unpaid_leave` decimal(12,2) DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `working_days` int DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `travel` decimal(12,2) DEFAULT NULL,
  `entered_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfarxywvy4kuamk8dvlxv1a6g` (`approved_by`),
  KEY `FK1utmvufusgyktdtbmo4xfas10` (`employee_id`),
  KEY `FKv5l0w9uavmee58b8idjq8ok` (`entered_by`),
  CONSTRAINT `FK1utmvufusgyktdtbmo4xfas10` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKfarxywvy4kuamk8dvlxv1a6g` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKv5l0w9uavmee58b8idjq8ok` FOREIGN KEY (`entered_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
INSERT INTO `salaries` VALUES (1,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-08',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(2,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-08',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(3,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-08',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(4,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-08',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(5,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-08',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(6,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-08',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(7,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-08',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(8,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-08',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(9,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-08',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(10,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-08',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(11,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-08',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(12,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-08',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(13,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-08',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(14,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-08',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(15,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-08',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(16,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-08',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(17,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-04',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(18,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-04',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(19,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-04',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(20,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-04',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(21,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-04',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(22,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-04',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(23,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-04',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(24,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-04',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(25,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-04',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(26,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-04',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(27,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-04',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(28,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-04',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(29,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-04',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(30,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-04',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(31,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-04',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(32,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-04',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(48,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-05',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(49,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-05',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(50,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-05',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(51,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-05',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(52,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-05',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(53,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-05',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(54,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-05',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(55,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-05',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(56,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-05',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(57,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-05',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(58,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-05',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(59,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-05',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(60,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-05',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(61,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-05',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(62,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-05',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(63,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-05',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(79,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-06',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(80,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-06',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(81,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-06',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(82,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-06',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(83,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-06',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(84,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-06',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(85,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-06',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(86,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-06',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(87,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-06',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(88,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-06',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(89,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-06',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(90,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-06',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(91,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-06',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(92,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-06',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(93,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-06',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(94,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-06',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(110,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-07',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(111,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-07',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(112,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-07',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(113,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-07',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(114,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-07',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(115,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-07',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(116,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-07',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(117,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-07',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(118,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-07',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(119,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-07',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(120,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-07',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(121,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-07',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(122,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-07',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(123,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-07',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(124,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-07',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(125,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-07',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(141,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-09',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(142,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-09',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(143,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-09',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(144,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-09',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(145,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-09',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(146,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-09',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(147,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-09',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(148,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-09',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(149,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-09',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(150,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-09',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(151,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-09',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(152,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-09',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(153,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-09',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(154,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-09',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(155,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-09',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(156,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-09',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(172,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-10',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(173,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-10',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(174,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-10',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(175,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-10',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(176,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-10',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(177,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-10',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(178,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-10',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(179,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-10',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(180,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-10',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(181,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-10',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(182,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-10',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(183,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-10',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(184,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-10',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(185,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-10',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(186,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-10',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(187,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-10',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(203,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-11',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(204,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-11',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(205,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-11',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(206,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-11',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(207,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-11',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(208,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-11',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(209,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-11',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(210,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-11',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(211,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-11',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(212,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-11',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(213,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-11',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(214,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-11',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(215,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-11',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(216,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-11',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(217,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-11',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(218,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-11',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(234,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2026-12',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(235,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2026-12',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(236,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2026-12',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(237,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2026-12',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(238,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2026-12',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(239,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2026-12',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(240,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-12',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(241,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2026-12',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(242,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2026-12',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(243,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2026-12',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(244,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2026-12',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(245,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2026-12',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(246,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2026-12',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(247,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2026-12',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(248,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2026-12',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(249,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2026-12',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(265,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2027-01',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(266,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2027-01',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(267,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2027-01',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(268,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2027-01',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(269,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2027-01',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(270,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2027-01',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(271,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-01',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(272,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2027-01',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(273,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2027-01',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(274,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2027-01',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(275,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2027-01',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(276,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2027-01',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(277,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-01',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(278,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2027-01',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(279,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2027-01',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(280,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2027-01',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(296,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2027-02',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(297,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2027-02',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(298,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2027-02',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(299,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2027-02',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(300,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2027-02',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(301,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2027-02',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(302,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-02',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(303,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2027-02',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(304,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2027-02',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(305,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2027-02',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(306,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2027-02',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(307,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2027-02',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(308,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-02',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(309,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2027-02',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(310,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2027-02',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(311,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2027-02',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1),(327,3080.00,0.00,0.00,0.00,3730.00,0.00,10000.00,'2027-03',-16270.00,650.00,6.5,5500.00,0.00,20000.00,3730.00,5000.00,0,28,2,1,'APPROVED',NULL,1),(328,3190.00,0.00,0.00,0.00,4190.00,0.00,0.00,'2027-03',-810.00,1000.00,10,5000.00,0.00,5000.00,4190.00,0.00,0,29,2,2,'APPROVED',NULL,1),(329,4860.00,2720.00,1020.00,2720.00,51760.00,5100.00,0.00,'2027-03',49040.00,1000.00,10,0.00,6800.00,2720.00,55500.00,0.00,0,30,2,3,'APPROVED',NULL,1),(330,4860.00,0.00,0.00,0.00,5860.00,0.00,5000.00,'2027-03',860.00,1000.00,10,0.00,0.00,5000.00,5860.00,0.00,0,30,2,20,'APPROVED',NULL,1),(331,4536.00,0.00,0.00,0.00,4936.00,0.00,0.00,'2027-03',-64.00,400.00,4,0.00,0.00,5000.00,4936.00,5000.00,0,28,2,33,'APPROVED',NULL,1),(332,4860.00,2160.00,810.00,2160.00,41910.00,4050.00,0.00,'2027-03',39750.00,600.00,6,0.00,5400.00,2160.00,44880.00,0.00,0,30,2,36,'APPROVED',NULL,1),(333,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-03',39650.00,500.00,5,0.00,5400.00,2160.00,44780.00,0.00,0,30,2,37,'APPROVED',NULL,1),(334,4860.00,2160.00,810.00,2160.00,42210.00,4050.00,0.00,'2027-03',40050.00,900.00,9,0.00,5400.00,2160.00,45180.00,0.00,0,30,2,39,'APPROVED',NULL,1),(335,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,5000.00,'2027-03',35700.00,800.00,8,0.00,4500.00,7400.00,46400.00,0.00,0,30,2,40,'APPROVED',NULL,1),(336,3300.00,2160.00,810.00,2160.00,39100.00,4050.00,0.00,'2027-03',36940.00,700.00,7,0.00,4050.00,2160.00,42070.00,0.00,0,30,2,43,'APPROVED',NULL,1),(337,4860.00,2160.00,810.00,2160.00,41610.00,4050.00,0.00,'2027-03',34450.00,300.00,3,0.00,5400.00,7160.00,44580.00,5000.00,0,30,2,44,'APPROVED',NULL,1),(338,4860.00,2160.00,810.00,2160.00,41560.00,4050.00,5000.00,'2027-03',34400.00,250.00,2.5,0.00,5400.00,7160.00,44530.00,0.00,0,30,2,45,'APPROVED',NULL,1),(339,4860.00,2160.00,810.00,2160.00,41810.00,4050.00,0.00,'2027-03',34650.00,500.00,5,5000.00,5400.00,7160.00,44780.00,0.00,0,30,2,46,'APPROVED',NULL,1),(340,3300.00,2400.00,900.00,2400.00,42900.00,4500.00,0.00,'2027-03',40500.00,600.00,6,0.00,4500.00,2400.00,46200.00,0.00,0,30,2,47,'APPROVED',NULL,1),(341,3300.00,2400.00,900.00,2400.00,43100.00,4500.00,10000.00,'2027-03',25700.00,800.00,8,0.00,4500.00,17400.00,46400.00,5000.00,0,30,2,48,'APPROVED',NULL,1),(342,3300.00,2160.00,810.00,2160.00,39300.00,4050.00,0.00,'2027-03',27140.00,900.00,9,5000.00,4050.00,12160.00,42270.00,5000.00,0,30,2,50,'APPROVED',NULL,1);
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_conditions`
--

DROP TABLE IF EXISTS `salary_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_conditions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `condition_name` varchar(255) DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmcnhqbalvjuf6lq8cdqjcnftt` (`created_by`),
  KEY `FKgvf7k2ycmccs5f45moat0v76` (`updated_by`),
  CONSTRAINT `FKgvf7k2ycmccs5f45moat0v76` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKmcnhqbalvjuf6lq8cdqjcnftt` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_conditions`
--

LOCK TABLES `salary_conditions` WRITE;
/*!40000 ALTER TABLE `salary_conditions` DISABLE KEYS */;
INSERT INTO `salary_conditions` VALUES (1,'IncentiveRate',NULL,NULL,NULL),(2,'SalesRate',NULL,NULL,NULL),(3,'AttendanceAmount',NULL,NULL,NULL),(4,'PayPerOtHour',NULL,NULL,NULL),(5,'EmployeeEPF',NULL,NULL,NULL),(6,'CompanyETF',NULL,NULL,NULL),(7,'NoPayLeave',NULL,NULL,NULL),(8,'CompanyEPF',NULL,NULL,NULL);
/*!40000 ALTER TABLE `salary_conditions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_meta_data`
--

DROP TABLE IF EXISTS `salary_meta_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_meta_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` double DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `salary_condition_id` int DEFAULT NULL,
  `update_status` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKaw1s9ygohowf1wwuhmtvpyk5f` (`role_id`),
  KEY `FKbjuaqf6rlt6a4mbl6vklxwvnh` (`salary_condition_id`),
  KEY `FKck4lfrr5b7iybob1p03k20qtp` (`created_by`),
  KEY `FKrvfv8703vu9d9lbdvywxp5okd` (`updated_by`),
  CONSTRAINT `FKaw1s9ygohowf1wwuhmtvpyk5f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKbjuaqf6rlt6a4mbl6vklxwvnh` FOREIGN KEY (`salary_condition_id`) REFERENCES `salary_conditions` (`id`),
  CONSTRAINT `FKck4lfrr5b7iybob1p03k20qtp` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  CONSTRAINT `FKrvfv8703vu9d9lbdvywxp5okd` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_meta_data`
--

LOCK TABLES `salary_meta_data` WRITE;
/*!40000 ALTER TABLE `salary_meta_data` DISABLE KEYS */;
INSERT INTO `salary_meta_data` VALUES (1,15,2,1,NULL,NULL,NULL),(2,15,3,1,NULL,NULL,NULL),(3,20,2,2,NULL,NULL,NULL),(4,15,3,2,NULL,NULL,NULL),(5,162,2,3,NULL,NULL,NULL),(6,110,3,3,NULL,NULL,NULL),(7,100,2,4,NULL,NULL,NULL),(8,100,3,4,NULL,NULL,NULL),(9,8,2,5,NULL,NULL,NULL),(10,8,3,5,NULL,NULL,NULL),(11,3,2,6,NULL,NULL,NULL),(12,3,3,6,NULL,NULL,NULL),(13,12,2,7,NULL,NULL,NULL),(14,12,3,7,NULL,NULL,NULL),(15,15,1,1,NULL,NULL,NULL),(16,15,1,2,NULL,NULL,NULL),(17,110,1,3,NULL,NULL,NULL),(18,100,1,4,NULL,NULL,NULL),(19,8,1,5,NULL,NULL,NULL),(20,3,1,6,NULL,NULL,NULL),(21,12,1,7,NULL,NULL,NULL),(22,8,1,8,NULL,NULL,NULL),(23,8,2,8,NULL,NULL,NULL),(24,8,3,8,NULL,NULL,NULL);
/*!40000 ALTER TABLE `salary_meta_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trial_balance`
--

DROP TABLE IF EXISTS `trial_balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trial_balance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_name` varchar(255) DEFAULT NULL,
  `account_type` enum('Assets','BankAccounts','Equity','Expenses','Income','Liabilities') DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `financial_date` date DEFAULT NULL,
  `transaction_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trial_balance`
--

LOCK TABLES `trial_balance` WRITE;
/*!40000 ALTER TABLE `trial_balance` DISABLE KEYS */;
INSERT INTO `trial_balance` VALUES (1,'Accountany Fee','Liabilities',15000.00,'2027-01-30','CR'),(2,'Cash','BankAccounts',12560.00,'2027-01-30','DR'),(3,'Audit Fee','Liabilities',25000.00,'2027-01-30','CR'),(4,'Share capital','Equity',6000.00,'2027-01-30','CR'),(5,'Director C/A - Invetment','Equity',1000000.00,'2027-01-30','CR'),(6,'Receivables','Assets',112919.50,'2027-01-30','DR'),(7,'Dirtectors remuniration','Expenses',1200000.00,'2027-01-30','DR'),(8,'Income Tax','Expenses',1000.00,'2027-01-30','DR'),(9,'Accountany Fee','Expenses',15000.00,'2027-01-30','DR'),(10,'Audit Fee','Expenses',25000.00,'2027-01-30','DR');
/*!40000 ALTER TABLE `trial_balance` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02 12:21:23
