-- Make sure tags aren't empty
DROP TRIGGER IF EXISTS fki_tags;
CREATE TRIGGER fki_tags
BEFORE INSERT ON tags
  FOR EACH ROW BEGIN
    SELECT RAISE(ABORT, 'Tag cannot be blank')
    WHERE TRIM(NEW.name)='';---
  END;

DROP TRIGGER IF EXISTS fku_tags;
CREATE TRIGGER fku_tags
  BEFORE UPDATE OF name ON tags
  FOR EACH ROW BEGIN
      SELECT RAISE(ABORT, 'Tag cannot be blank')
      WHERE TRIM(NEW.name)='';
  END;

-- Don't allow empty creators
DROP TRIGGER IF EXISTS insert_creatorData;
CREATE TRIGGER insert_creators BEFORE INSERT ON creators
  FOR EACH ROW WHEN NEW.firstName='' AND NEW.lastName=''
  BEGIN
    SELECT RAISE (ABORT, 'Creator names cannot be empty');---
  END;

DROP TRIGGER IF EXISTS update_creatorData;
CREATE TRIGGER update_creators BEFORE UPDATE ON creators
  FOR EACH ROW WHEN NEW.firstName='' AND NEW.lastName=''
  BEGIN
    SELECT RAISE (ABORT, 'Creator names cannot be empty');---
  END;