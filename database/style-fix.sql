update event_settings
set content = jsonb_set(content, '{backgroundColor}', '"#fbfaf8"', true)
where id = 'main'
  and content->>'backgroundColor' = '#f7f1ea';

update event_settings
set content = jsonb_set(
  content,
  '{coverImageUrl}',
  '"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85"',
  true
)
where id = 'main'
  and coalesce(content->>'coverImageUrl', '') = '';

update event_settings
set content = jsonb_set(content, '{initials}', '["А", "Н"]'::jsonb, true)
where id = 'main'
  and content->'initials' = '["Н", "Д"]'::jsonb;

update event_settings
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{venueTitle}',
        '"Ресторан Луи"',
        true
      ),
      '{venueText}',
      '"Праздничный банкет пройдет в ресторане Луи. Будем ждать вас на уютном вечере с ужином, тостами и танцами."',
      true
    ),
    '{venueAddress}',
    '"г. Екатеринбург, ул. Радищева, 1"',
    true
  ),
  '{mapEmbedUrl}',
  '"https://yandex.ru/map-widget/v1/?ll=60.600394%2C56.830349&z=16&pt=60.600394%2C56.830349%2Cpm2rdm"',
  true
)
where id = 'main';

update event_settings
set content = jsonb_set(
  content,
  '{timeline}',
  '[
    {"time": "12:00", "title": "Сбор гостей", "description": "Просим взять с собой хорошее настроение и свои улыбки"},
    {"time": "12:30", "title": "Регистрация в ЗАГСе", "description": "Ленинский ЗАГС Екатеринбурга. На всякий случай приготовьте носовые платочки для трогательного момента"},
    {"time": "14:00", "title": "Праздничный банкет", "description": "Время вкусной еды, танцев и развлечений"},
    {"time": "23:00", "title": "Окончание мероприятия", "description": "К сожалению, даже такой прекрасный вечер может закончиться"}
  ]'::jsonb,
  true
)
where id = 'main';

update event_settings
set content = jsonb_set(
  content,
  '{details}',
  case
    when exists (
      select 1
      from jsonb_array_elements(coalesce(content->'details', '[]'::jsonb)) as item
      where item->>'title' = 'ЗАГС'
    )
    then content->'details'
    else jsonb_build_array(
      jsonb_build_object('title', 'ЗАГС', 'text', 'Торжественная регистрация пройдет в Ленинском ЗАГСе Екатеринбурга.')
    ) || coalesce(content->'details', '[]'::jsonb)
  end,
  true
)
where id = 'main';

update event_settings
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{registryTitle}',
        '"Ленинский ЗАГС"',
        true
      ),
      '{registryText}',
      '"Торжественная регистрация пройдет в Ленинском ЗАГСе Екатеринбурга."',
      true
    ),
    '{registryAddress}',
    '"г. Екатеринбург, ул. Сакко и Ванцетти, 105к1"',
    true
  ),
  '{registryMapEmbedUrl}',
  '"https://yandex.ru/map-widget/v1/?ll=60.591959%2C56.827655&z=16&pt=60.591959%2C56.827655%2Cpm2rdm"',
  true
)
where id = 'main';
