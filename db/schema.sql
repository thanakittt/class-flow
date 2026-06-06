CREATE TYPE course_day AS ENUM (
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN'
);

CREATE TABLE courses (
  code text PRIMARY KEY,
  english_name text NOT NULL,
  thai_name text NOT NULL,
  instructor text NOT NULL,
  day course_day NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  section smallint NOT NULL,
  CONSTRAINT courses_end_time_after_start_time CHECK (end_time > start_time)
);
