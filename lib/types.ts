export type AttendanceStatus = "attending" | "declined" | "unknown";

export type TimelineItem = {
  time: string;
  title: string;
  description: string;
};

export type DetailItem = {
  title?: string;
  text: string;
};

export type DressCode = {
  intro: string;
  colors: string[];
};

export type RsvpQuestion = {
  title: string;
  deadlineText: string;
  drinks: string[];
};

export type EventSettings = {
  coupleNames: string;
  initials: string[];
  weddingDate: string;
  heroDateLabel: string;
  guestHeading: string;
  introText: string;
  timeline: TimelineItem[];
  venueTitle: string;
  venueText: string;
  venueAddress: string;
  mapEmbedUrl: string;
  registryTitle: string;
  registryText: string;
  registryAddress: string;
  registryMapEmbedUrl: string;
  details: DetailItem[];
  dressCode: DressCode;
  rsvp: RsvpQuestion;
  finalText: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  coverImageUrl?: string;
};

export type Guest = {
  id: string;
  display_name: string;
  salutation: string | null;
  token: string;
  created_at: string;
};

export type RsvpResponse = {
  id: string;
  guest_id: string | null;
  guest_token?: string | null;
  status: AttendanceStatus;
  plus_one: boolean;
  entered_names: string;
  drink_preferences: string[];
  created_at: string;
  updated_at: string;
};

export type AdminGuestRow = Guest & {
  rsvp_responses?: RsvpResponse[];
};
