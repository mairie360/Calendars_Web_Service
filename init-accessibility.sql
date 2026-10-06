-- Data of the states of rgaa.yaml (accessibility stack only, run by seeder-a11y after init-test.sql).
-- Schema: liquibase-migrations 1.3.0 (events, event_members, recurrence_rules, groups).
-- The RGAA engine fixes the browser clock at 2026-01-15T09:00:00+01:00 (a Thursday): the events
-- sit around that day so the month, week and day views all show some. Fixed ids from 900, far from
-- the ones the API hands out, and the sequences are moved past them.
--
-- Users (user 2, role User, comes from init-test.sql):
--   3  Rgaa Writer       User         only for the writing state (create-event-saved)
--   4  Rgaa Responsable  Responsable  validates the pending event of user 2 (same group)
INSERT INTO users (id, first_name, last_name, email, password, status) VALUES
    (3, 'Rgaa', 'Writer', 'rgaa-writer@mairie360.fr', 'dummy', 'active'),
    (4, 'Rgaa', 'Responsable', 'rgaa-responsable@mairie360.fr', 'dummy', 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role_id)
SELECT 3, r.id FROM roles r WHERE r.name = 'User'
ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id)
SELECT 4, r.id FROM roles r WHERE r.name = 'Responsable'
ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT max(id) FROM users), 1000));

-- One service shared by users 2 and 4: an event of user 2 with user 4 assigned needs his approval.
-- The trigger trigger_add_owner_as_member adds the owner (user 4) as a member.
INSERT INTO groups (id, owner_id, name, description)
VALUES (900, 4, 'Service Culture', 'Service of the RGAA seed')
ON CONFLICT (id) DO NOTHING;
INSERT INTO group_members (group_id, user_id) VALUES (900, 2) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('groups', 'id'), GREATEST((SELECT max(id) FROM groups), 1000));

-- Weekly rule of the recurring event 904 (every Tuesday of January 2026, 14:00 Paris, 1 h).
INSERT INTO recurrence_rules (id, type_recurrence, intervalle, start_date, end_date, start_time, duration,
                              owner_id, days_of_week)
VALUES (900, 'weekly', 1, '2026-01-06 14:00:00+01', '2026-02-01 00:00:00+00', '13:00:00', '1 hour',
        2, ARRAY[2]::smallint[])
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('recurrence_rules', 'id'),
              GREATEST((SELECT max(id) FROM recurrence_rules), 1000));

INSERT INTO events (id, name, description, start_date, end_date, created_by, owner_id, category, location,
                    recurrence_id, is_exception) VALUES
    (900, 'Conseil municipal', 'Séance publique du conseil municipal.',
     '2026-01-15 10:00:00+01', '2026-01-15 12:00:00+01', 2, 2, 'meeting', 'Salle du conseil', NULL, NULL),
    (901, 'Atelier numérique', 'Initiation aux démarches en ligne.',
     '2026-01-16 14:00:00+01', '2026-01-16 16:00:00+01', 2, 2, 'activity', 'Médiathèque', NULL, NULL),
    (902, 'Cérémonie des vœux', 'Vœux du maire aux habitants.',
     '2026-01-20 18:00:00+01', '2026-01-20 19:30:00+01', 2, 2, 'ceremony', 'Salle des fêtes', NULL, NULL),
    (903, 'Réunion de quartier', NULL,
     '2026-01-13 09:00:00+01', '2026-01-13 10:30:00+01', 2, 2, 'other', NULL, NULL, NULL),
    (904, 'Permanence du maire', 'Accueil des habitants sans rendez-vous.',
     '2026-01-06 14:00:00+01', '2026-01-06 15:00:00+01', 2, 2, 'meeting', 'Mairie', 900, false)
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('events', 'id'), GREATEST((SELECT max(id) FROM events), 1000));

-- User 2 is assigned to every event (canEdit / canDelete as the creator). Event 901 also has the
-- Responsable 4, who shares a group with user 2: it waits for his approval (canValidate for user 4).
INSERT INTO event_members (event_id, user_id, validation_status) VALUES
    (900, 2, 'validated'),
    (901, 2, 'pending'),
    (901, 4, 'pending'),
    (902, 2, 'validated'),
    (903, 2, 'validated'),
    (904, 2, 'validated')
ON CONFLICT DO NOTHING;
