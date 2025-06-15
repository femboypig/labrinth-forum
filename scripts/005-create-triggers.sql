-- Function to update post count on category
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Trigger for posts
DROP TRIGGER IF EXISTS on_post_change ON posts;
CREATE TRIGGER on_post_change
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_category_post_count();


-- Function to update reply count on category
CREATE OR REPLACE FUNCTION update_category_reply_count()
RETURNS TRIGGER AS $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Find the category_id from the post table
  SELECT category_id INTO v_category_id FROM posts WHERE id = NEW.post_id;

  IF (TG_OP = 'INSERT') THEN
    UPDATE categories SET reply_count = reply_count + 1 WHERE id = v_category_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- On delete, find the category from the OLD post_id
    SELECT category_id INTO v_category_id FROM posts WHERE id = OLD.post_id;
    UPDATE categories SET reply_count = reply_count - 1 WHERE id = v_category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for replies
DROP TRIGGER IF EXISTS on_reply_change ON replies;
CREATE TRIGGER on_reply_change
AFTER INSERT OR DELETE ON replies
FOR EACH ROW EXECUTE FUNCTION update_category_reply_count();
