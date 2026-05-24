import type { EventSettings } from "./types.js";

export const fixedWeddingSettings = {
  coupleNames: "Алексей и Надежда",
  initials: ["А", "Н"],
  weddingDate: "2026-08-22T11:00:00+05:00",
  heroDateLabel: "22 августа 2026 г.",
  accentColor: "#8a6b5a",
  backgroundColor: "#fbfaf8",
  textColor: "#2b2520"
} satisfies Pick<
  EventSettings,
  "coupleNames" | "initials" | "weddingDate" | "heroDateLabel" | "accentColor" | "backgroundColor" | "textColor"
>;

export function withFixedWeddingSettings(settings: EventSettings): EventSettings {
  return {
    ...settings,
    ...fixedWeddingSettings,
    initials: [...fixedWeddingSettings.initials]
  };
}

export const defaultSettings: EventSettings = {
  ...fixedWeddingSettings,
  initials: [...fixedWeddingSettings.initials],
  guestHeading: "Дорогие гости!",
  introText:
    "В нашей жизни предстоят счастливые перемены! Мы хотим, чтобы в этот день рядом с нами были самые близкие и дорогие для нас люди. Будем рады разделить с вами чудесный праздник в день нашей свадьбы.",
  timeline: [
    {
      time: "12:00",
      title: "Сбор гостей",
      description: "Просим взять с собой хорошее настроение и свои улыбки"
    },
    {
      time: "12:30",
      title: "Регистрация в ЗАГСе",
      description: "Ленинский ЗАГС Екатеринбурга. На всякий случай приготовьте носовые платочки для трогательного момента"
    },
    {
      time: "14:00",
      title: "Праздничный банкет",
      description: "Время вкусной еды, танцев и развлечений"
    },
    {
      time: "23:00",
      title: "Окончание мероприятия",
      description: "К сожалению, даже такой прекрасный вечер может закончиться"
    }
  ],
  venueTitle: "Ресторан Луи",
  venueText:
    "Праздничный банкет пройдет в ресторане Луи. Будем ждать вас на уютном вечере с ужином, тостами и танцами.",
  venueAddress: "г. Екатеринбург, ул. Радищева, 1",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=60.600394%2C56.830349&z=16&pt=60.600394%2C56.830349%2Cpm2rdm",
  registryTitle: "Ленинский ЗАГС",
  registryText:
    "Торжественная регистрация пройдет в Ленинском ЗАГСе Екатеринбурга.",
  registryAddress: "г. Екатеринбург, ул. Сакко и Ванцетти, 105к1",
  registryMapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=60.591959%2C56.827655&z=16&pt=60.591959%2C56.827655%2Cpm2rdm",
  details: [
    {
      title: "ЗАГС",
      text: "Торжественная регистрация пройдет в Ленинском ЗАГСе Екатеринбурга."
    },
    {
      text: "Ваши улыбки и смех подарят нам незабываемое счастье в этот день, а пожелания в конвертах помогут осуществить наши мечты!"
    },
    {
      text: "Приятным комплиментом для нас вместо цветов будет бутылочка вашего любимого вина, которую мы откроем на ближайшем совместном празднике."
    },
    {
      text: "Будем благодарны, если вы воздержитесь от криков «Горько» на празднике, ведь поцелуй - это знак выражения чувств, он не может быть по заказу."
    }
  ],
  contacts: [
    { role: "Организатор", name: "Виктория", phone: "" },
    { role: "Жених", name: "Алексей", phone: "" },
    { role: "Невеста", name: "Надежда", phone: "" }
  ],
  dressCode: {
    intro:
      "Мы очень ждем и с удовольствием готовимся к нашему незабываемому дню! Поддержите нас вашими улыбками и объятиями, а также красивыми нарядами в палитре торжества.",
    colors: ["#d9c6b5", "#b98f7d", "#845f51", "#eee8df", "#3a332d"]
  },
  rsvp: {
    title: "Присутствие на торжестве",
    deadlineText: "Будем ждать ответ до 15.10.2026 г.",
    drinks: [
      "Вино красное",
      "Вино белое",
      "Виски",
      "Водка",
      "Шампанское",
      "Что-нибудь безалкогольное"
    ]
  },
  finalText: "Мы будем счастливы видеть вас!",
  accentColor: "#8a6b5a",
  backgroundColor: "#fbfaf8",
  textColor: "#2b2520",
  coverImageUrl:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85"
};
