-- Create function that inserts a profile whenever a new user is created
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile pointing to the newly created user
    INSERT INTO profiles (user_id, name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,                  -- profile.user_id
        NEW.name,                -- default name from user
        NEW.image,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_profile ON users;

CREATE TRIGGER trigger_create_profile
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();