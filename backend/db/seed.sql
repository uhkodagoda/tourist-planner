-- Seed data: preliminary list of places of interest from the project proposal (Section 1.8)
USE tourist_planner;

INSERT INTO places (name, category, description, opening_times, travel_tips, distance_km, latitude, longitude, is_verified, image_url)
VALUES
('Sri Sumanarama Purana Viharaya', 'Religious',
 'A historic Buddhist temple in Batakeththara with over a century of heritage; a quiet, easily accessible religious site close to Bokundara.',
 '6:00 AM - 8:00 PM daily',
 'Dress modestly and remove footwear before entering the shrine areas. A short, calm visit that works well as a first stop.',
 2.0, 6.8215, 79.9312, 0, NULL),

('Bellanwila Raja Maha Viharaya', 'Religious',
 'A well-known Buddhist temple on the banks of the Bolgoda canal, popular for its annual perahera and peaceful surroundings.',
 '5:30 AM - 8:30 PM daily',
 'Visit early morning or late afternoon to avoid the midday heat. Especially lively during the annual perahera season.',
 6.0, 6.8451, 79.8896, 1, NULL),

('Bolgoda Lake (Piliyandala / Moratuwa side)', 'Nature',
 'The largest natural fresh-water lake in Sri Lanka; offers boating, birdwatching and scenic views for a relaxing half-day stop.',
 '7:00 AM - 6:00 PM (boat rides, weather permitting)',
 'Best visited in the morning for birdwatching. Boat trips can be arranged with local operators near the lake.',
 8.0, 6.7935, 79.9037, 0, NULL),

('Sri Lanka Air Force Museum, Ratmalana', 'Heritage',
 'A museum displaying historic aircraft and Air Force memorabilia, of interest to visitors keen on military and aviation history.',
 '9:00 AM - 4:00 PM, Tuesday - Sunday (closed Mondays)',
 'Allow about an hour for a full walkthrough. Photography rules may apply near active airbase areas.',
 6.0, 6.8206, 79.8862, 1, NULL),

('Mount Lavinia Beach', 'Recreational',
 'A popular sandy beach with a promenade, seafood restaurants and colonial-era hotel, ideal for a relaxed evening visit.',
 'Open 24 hours (restaurants typically 10:00 AM - 10:00 PM)',
 'Great for a sunset stop near the end of the day. Try the beachside seafood restaurants along the promenade.',
 10.0, 6.8306, 79.8636, 1, NULL),

('National Zoological Gardens, Dehiwala', 'Recreational',
 'Sri Lanka''s largest zoo, featuring animals from around the world, including a well-known elephant enclosure and aquarium.',
 '8:30 AM - 6:00 PM daily',
 'Arrive early to see feeding sessions and avoid the midday crowds. Comfortable walking shoes are recommended.',
 9.0, 6.8500, 79.8747, 1, NULL),

('Colombo National Museum', 'Heritage',
 'Sri Lanka''s premier museum, housed in a 19th-century Italianate building in Cinnamon Gardens, displaying royal regalia, archaeological finds and cultural artefacts tracing the island''s history.',
 '9:00 AM - 5:00 PM, Tuesday - Sunday (closed Mondays)',
 'Allow 1.5-2 hours for a thorough visit. Combine with nearby Viharamahadevi Park in the same trip.',
 20.0, 6.9107, 79.8613, 1, NULL),

('Viharamahadevi Park, Colombo', 'Nature',
 'The largest park in central Colombo, featuring gardens, a small zoo section and open lawns close to the city centre.',
 '5:00 AM - 9:00 PM daily',
 'A pleasant place for a short walk or rest between other Colombo-city stops. Food vendors are available near the entrances.',
 16.0, 6.9169, 79.8612, 0, NULL),

('Gangaramaya Temple, Colombo', 'Cultural',
 'A landmark Buddhist temple blending Sri Lankan, Thai, Indian and Chinese architecture, with an attached museum of eclectic artefacts.',
 '6:00 AM - 10:00 PM daily',
 'Dress modestly. The attached museum and adjoining Seema Malaka (on Beira Lake) are worth combining with this stop.',
 17.0, 6.9167, 79.8563, 1, NULL),

('Galle Face Green, Colombo', 'Recreational',
 'An oceanfront urban park in the heart of Colombo, popular for evening walks, street food and sunset views.',
 'Open 24 hours (street food vendors typically active 4:00 PM - 10:00 PM)',
 'A good final stop of the day for sunset and street food such as isso wade and kottu. Can get crowded on weekends.',
 17.0, 6.9271, 79.8449, 1, NULL);
