-- Add place_text column to event table
-- This allows events to store a place as free text without requiring the Place entity
ALTER TABLE event ADD COLUMN place_text TEXT;
