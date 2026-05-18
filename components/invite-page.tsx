import { Countdown } from "@/components/countdown";
import { RsvpForm } from "@/components/rsvp-form";
import { RevealController } from "@/components/reveal-controller";
import type { EventSettings, Guest, RsvpResponse } from "@/lib/types";

type Props = {
  settings: EventSettings;
  guest?: Guest;
  response?: RsvpResponse;
};

export function InvitePage({ settings, guest, response }: Props) {
  const coverStyle = settings.coverImageUrl
    ? ({ "--cover-image": `url(${settings.coverImageUrl})` } as React.CSSProperties)
    : undefined;
  const greetingTitle = guest?.salutation || settings.guestHeading;

  return (
    <main
      className="invite-page"
      style={
        {
          "--bg": settings.backgroundColor,
          "--text": settings.textColor,
          "--accent": settings.accentColor
        } as React.CSSProperties
      }
    >
      <RevealController />
      <section className="hero" style={coverStyle}>
        <div className="hero-inner">
          <div className="initials" aria-hidden="true">
            <span>{settings.initials[0] ?? "Н"}</span>
            <i />
            <span>{settings.initials[1] ?? "Д"}</span>
          </div>
          <div className="hero-title">
            <h1>{settings.coupleNames}</h1>
          </div>
          <p className="hero-date">{settings.heroDateLabel}</p>
        </div>
      </section>

      <section className="section compact reveal">
        <h2 className="section-title">{greetingTitle}</h2>
        <p className="lead">{settings.introText}</p>
      </section>

      <section className="section countdown-section reveal">
        <h2 className="section-title">До свадьбы осталось</h2>
        <Countdown date={settings.weddingDate} />
      </section>

      <section className="section reveal">
        <h2 className="section-title">Программа дня</h2>
        <div className="timeline">
          {settings.timeline.map((item) => (
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
        <h2 className="section-title">{settings.registryTitle}</h2>
        <p>{settings.registryText}</p>
        <p style={{ marginTop: 10 }}>{settings.registryAddress}</p>
        <div className="map-frame">
          <iframe src={settings.registryMapEmbedUrl} title="Карта ЗАГСа" loading="lazy" />
        </div>
      </section>

      <section className="section reveal location">
        <h2 className="section-title">{settings.venueTitle}</h2>
        <p>{settings.venueText}</p>
        <p style={{ marginTop: 10 }}>{settings.venueAddress}</p>
        <div className="map-frame">
          <iframe src={settings.mapEmbedUrl} title="Карта места проведения" loading="lazy" />
        </div>
      </section>

      <section className="section reveal details">
        <h2 className="section-title">Детали</h2>
        {settings.details.map((detail, index) => (
          <div key={`${detail.text}-${index}`}>
            {detail.title ? <h3>{detail.title}</h3> : null}
            <p>{detail.text}</p>
            {index < settings.details.length - 1 ? <div className="detail-separator">~</div> : null}
          </div>
        ))}
      </section>

      <section className="section reveal">
        <h2 className="section-title">{settings.rsvp.title}</h2>
        <RsvpForm settings={settings} guest={guest} response={response} />
      </section>

      <section className="final reveal">{settings.finalText}</section>
    </main>
  );
}
