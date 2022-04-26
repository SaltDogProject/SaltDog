-- This file is part of the Saltdog SQLite database
-- Thanks to Zotero Schema!
-- Used to init db structure

DROP TABLE IF EXISTS charsets;
CREATE TABLE charsets (
    charsetID INTEGER PRIMARY KEY,
    charset TEXT UNIQUE
);
CREATE INDEX charsets_charset ON charsets(charset);

-- Valid item types ("book," "journalArticle," etc.)
-- display 0 == hide, 1 == display, 2 == primary
CREATE TABLE IF NOT EXISTS itemTypes (
    itemTypeID INTEGER PRIMARY KEY,
    typeName TEXT,
    templateItemTypeID INT,
    display INT DEFAULT 1
);

-- Field types for item metadata
CREATE TABLE IF NOT EXISTS fields (
    fieldID INTEGER PRIMARY KEY,
    fieldName TEXT
);

-- Defines valid fields for each itemType, their display order, and their default visibility
CREATE TABLE IF NOT EXISTS itemTypeFields (
    itemTypeID INT,
    fieldID INT,
    hide INT,
    orderIndex INT,
    PRIMARY KEY (itemTypeID, orderIndex),
    UNIQUE (itemTypeID, fieldID),
    FOREIGN KEY (itemTypeID) REFERENCES itemTypes(itemTypeID),
    FOREIGN KEY (fieldID) REFERENCES fields(fieldID)
);
CREATE INDEX IF NOT EXISTS itemTypeFields_fieldID ON itemTypeFields(fieldID);

-- Maps base fields to type-specific fields (e.g. publisher to label in audioRecording)
CREATE TABLE IF NOT EXISTS baseFieldMappings (
    itemTypeID INT,
    baseFieldID INT,
    fieldID INT,
    PRIMARY KEY (itemTypeID, baseFieldID, fieldID),
    FOREIGN KEY (itemTypeID) REFERENCES itemTypes(itemTypeID),
    FOREIGN KEY (baseFieldID) REFERENCES fields(fieldID),
    FOREIGN KEY (fieldID) REFERENCES fields(fieldID)
);
CREATE INDEX IF NOT EXISTS baseFieldMappings_baseFieldID ON baseFieldMappings(baseFieldID);
CREATE INDEX IF NOT EXISTS baseFieldMappings_fieldID ON baseFieldMappings(fieldID);

-- Defines the possible creator types (contributor, editor, author)
CREATE TABLE IF NOT EXISTS creatorTypes (
    creatorTypeID INTEGER PRIMARY KEY,
    creatorType TEXT
);

CREATE TABLE IF NOT EXISTS itemTypeCreatorTypes (
    itemTypeID INT,
    creatorTypeID INT,
    primaryField INT,
    PRIMARY KEY (itemTypeID, creatorTypeID),
    FOREIGN KEY (itemTypeID) REFERENCES itemTypes(itemTypeID),
    FOREIGN KEY (creatorTypeID) REFERENCES creatorTypes(creatorTypeID)
);
CREATE INDEX IF NOT EXISTS itemTypeCreatorTypes_creatorTypeID ON itemTypeCreatorTypes(creatorTypeID);

--
-- End of tables populated by global schema
--

CREATE TABLE IF NOT EXISTS version (
    schema TEXT PRIMARY KEY,
    version INT NOT NULL
);
CREATE INDEX IF NOT EXISTS schema ON version(schema);


CREATE TABLE IF NOT EXISTS dirs (
  dirID INTEGER NOT NULL,
  libraryID INTEGER NOT NULL,
  parentDirID INTEGER NOT NULL,
  dirname TEXT NOT NULL,
  dateAdded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  clientDateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  key TEXT NOT NULL,
  synced INT NOT NULL DEFAULT 0,
  PRIMARY KEY (dirID),
  UNIQUE (libraryID, dirID),
  FOREIGN KEY (libraryID) REFERENCES libraries(libraryID) ON DELETE CASCADE,
  FOREIGN KEY (parentDirID) REFERENCES dirs(dirID) ON DELETE CASCADE
);

-- Primary data applicable to all items
CREATE TABLE IF NOT EXISTS items (
    itemID INTEGER PRIMARY KEY,
    itemTypeID INT NOT NULL,
    itemName TEXT NOT NULL,
    dateAdded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clientDateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    libraryID INT NOT NULL,
    dirID INT NOT NULL DEFAULT 1,
    extra TEXT,
    key TEXT NOT NULL,
    version INT NOT NULL DEFAULT 0,
    synced INT NOT NULL DEFAULT 0,
    UNIQUE (libraryID, key),
    FOREIGN KEY (libraryID) REFERENCES libraries(libraryID) ON DELETE CASCADE
    FOREIGN KEY (dirID) REFERENCES dirs(dirID) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS items_synced ON items(synced);

CREATE TABLE IF NOT EXISTS itemDataValues (
    valueID INTEGER PRIMARY KEY,
    value UNIQUE
);

-- Type-specific data for individual items
CREATE TABLE IF NOT EXISTS itemData (
    itemID INT,
    fieldID INT,
    valueID,
    PRIMARY KEY (itemID, fieldID),
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (fieldID) REFERENCES fields(fieldID),
    FOREIGN KEY (valueID) REFERENCES itemDataValues(valueID)
);
CREATE INDEX IF NOT EXISTS itemData_fieldID ON itemData(fieldID);

-- Metadata for attachment items
CREATE TABLE IF NOT EXISTS itemAttachments (
    attachmentID INTEGER PRIMARY KEY,
    parentItemID INT NOT NULL,
    name TEXT NOT NULL,
    contentType TEXT NOT NULL,
    charsetID INT,
    path TEXT,
    url TEXT,
    syncState INT DEFAULT 0,
    storageModTime INT,
    storageHash TEXT,
    lastProcessedModificationTime INT,
    FOREIGN KEY (parentItemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (charsetID) REFERENCES charsets(charsetID) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS itemAttachments_parentItemID ON itemAttachments(parentItemID);
CREATE INDEX IF NOT EXISTS itemAttachments_charsetID ON itemAttachments(charsetID);
CREATE INDEX IF NOT EXISTS itemAttachments_contentType ON itemAttachments(contentType);
CREATE INDEX IF NOT EXISTS itemAttachments_syncState ON itemAttachments(syncState);
CREATE INDEX IF NOT EXISTS itemAttachments_lastProcessedModificationTime ON itemAttachments(lastProcessedModificationTime);

CREATE TABLE IF NOT EXISTS relationPredicates (
    predicateID INTEGER PRIMARY KEY,
    predicate TEXT UNIQUE
);


CREATE TABLE IF NOT EXISTS itemRelations (
    itemID INT NOT NULL,
    predicateID INT NOT NULL,
    object TEXT NOT NULL,
    PRIMARY KEY (itemID, predicateID, object),
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (predicateID) REFERENCES relationPredicates(predicateID) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS itemRelations_predicateID ON itemRelations(predicateID);
CREATE INDEX IF NOT EXISTS itemRelations_object ON itemRelations(object);

CREATE TABLE IF NOT EXISTS tags (
    tagID INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS itemTags (
    itemID INT NOT NULL,
    tagID INT NOT NULL,
    color TEXT NOT NULL,
    type INT NOT NULL,
    PRIMARY KEY (itemID, tagID),
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (tagID) REFERENCES tags(tagID) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS itemTags_tagID ON itemTags(tagID);

CREATE TABLE IF NOT EXISTS creators (
    creatorID INTEGER PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    extra TEXT DEFAULT '-1'
);

CREATE TABLE IF NOT EXISTS itemCreators (
    itemID INT NOT NULL,
    creatorID INT NOT NULL,
    creatorTypeID INT NOT NULL DEFAULT 1,
    orderIndex INT NOT NULL DEFAULT 0,
    PRIMARY KEY (itemID, creatorID, creatorTypeID, orderIndex),
    UNIQUE (itemID, orderIndex),
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (creatorID) REFERENCES creators(creatorID) ON DELETE CASCADE,
    FOREIGN KEY (creatorTypeID) REFERENCES creatorTypes(creatorTypeID)
);
CREATE INDEX IF NOT EXISTS itemCreators_creatorTypeID ON itemCreators(creatorTypeID);


CREATE TABLE IF NOT EXISTS libraries (
    libraryID INTEGER PRIMARY KEY,
    libraryName TEXT NOT NULL,
    type TEXT NOT NULL,
    editable INT NOT NULL,
    filesEditable INT NOT NULL,
    version INT NOT NULL DEFAULT 0,
    storageVersion INT NOT NULL DEFAULT 0,
    lastSync  TIMESTAMP NOT NULL DEFAULT 0,
    archived INT NOT NULL DEFAULT 0
);

