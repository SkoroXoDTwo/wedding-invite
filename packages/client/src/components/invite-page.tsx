import { Countdown } from "./countdown";
import { RsvpForm } from "./rsvp-form";
import { RevealController } from "./reveal-controller";
import { type EventSettings, type Guest, type RsvpResponse, withFixedWeddingSettings } from "@wedding-invite/shared";

type Props = {
  settings: EventSettings;
  guest?: Guest;
  response?: RsvpResponse;
};

export function InvitePage({ settings, guest, response }: Props) {
  const displaySettings = withFixedWeddingSettings(settings);
  const coverStyle = displaySettings.coverImageUrl
    ? ({ "--cover-image": `url(${displaySettings.coverImageUrl})` } as React.CSSProperties)
    : undefined;
  const greetingTitle = guest?.salutation || displaySettings.guestHeading;

  return (
    <main
      className="invite-page"
      style={
        {
          "--bg": displaySettings.backgroundColor,
          "--text": displaySettings.textColor,
          "--accent": displaySettings.accentColor
        } as React.CSSProperties
      }
    >
      <RevealController />
      <section className="hero" style={coverStyle}>
        <div className="hero-inner">
          <div className="initials" aria-hidden="true">
            <span>{displaySettings.initials[0] ?? "А"}</span>
            <i />
            <span>{displaySettings.initials[1] ?? "Н"}</span>
          </div>
          <div className="hero-title">
            <h1>{displaySettings.coupleNames}</h1>
          </div>
          <p className="hero-date">{displaySettings.heroDateLabel}</p>
        </div>
      </section>

      <section className="section compact reveal">
        <h2 className="section-title">{greetingTitle}</h2>
        <p className="lead">{displaySettings.introText}</p>
      </section>

      <section className="section countdown-section reveal">
        <h2 className="section-title">До свадьбы осталось</h2>
        <Countdown date={displaySettings.weddingDate} />
      </section>

      <section className="section reveal">
        <h2 className="section-title">Программа дня</h2>
        <div className="timeline">
          {displaySettings.timeline.map((item) => (
            <article className="timeline-item" key={`${item.time}-${item.title}`}>
              <div className="timeline-time">{item.time}</div>
              <div className="timeline-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section reveal location">
        <h2 className="section-title">{displaySettings.registryTitle}</h2>
        <p>{displaySettings.registryText}</p>
        <p style={{ marginTop: 10 }}>{displaySettings.registryAddress}</p>
        <div className="map-frame">
          <iframe src={displaySettings.registryMapEmbedUrl} title="Карта ЗАГСа" loading="lazy" />
        </div>
      </section>

      <section className="section reveal location">
        <h2 className="section-title">{displaySettings.venueTitle}</h2>
        <p>{displaySettings.venueText}</p>
        <p style={{ marginTop: 10 }}>{displaySettings.venueAddress}</p>
        <div className="map-frame">
          <iframe src={displaySettings.mapEmbedUrl} title="Карта ресторана" loading="lazy" />
        </div>
      </section>

      <section className="section reveal details">
        <h2 className="section-title">Детали</h2>
        {displaySettings.details.map((detail, index) => (
          <div key={`${detail.text}-${index}`}>
            {detail.title ? <h3>{detail.title}</h3> : null}
            <p>{detail.text}</p>
            {index < displaySettings.details.length - 1 ? <div className="detail-separator">~</div> : null}
          </div>
        ))}
      </section>

      <section className="section reveal">
        <h2 className="section-title">{displaySettings.rsvp.title}</h2>
        <RsvpForm settings={displaySettings} guest={guest} response={response} />
      </section>

      {displaySettings.contacts.length ? (
        <section className="section reveal contacts">
          <h2 className="section-title">Контакты</h2>
          <p className="lead">
            Если появятся вопросы по дню свадьбы, деталям или маршруту, можно связаться с нами.
          </p>
          <div className="contact-list">
            {displaySettings.contacts.map((contact, index) => {
              const phoneHref = contact.phone?.replace(/[^\d+]/g, "");

              return (
                <article className="contact-item" key={`${contact.role}-${contact.name}-${index}`}>
                  <span>{contact.role}</span>
                  <strong>{contact.name}</strong>
                  {contact.phone ? <a href={`tel:${phoneHref}`}>{contact.phone}</a> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="final reveal">{displaySettings.finalText}</section>
    </main>
  );
}
