import * as Sentry from "@sentry/nuxt";
import {
  createVisitorForEvent,
  getEventWithFields,
  visitorHttpError,
  VisitorConflictError,
  VisitorValidationError,
} from "../utils/validateVisitorPayload";

const INTIM_SLUG = "probuild-intim-2026";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));

  try {
    const eventRecord = await getEventWithFields({ slug: INTIM_SLUG });

    if (!eventRecord || !eventRecord.isActive) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan atau tidak aktif.",
      });
    }

    const visitor = await createVisitorForEvent(eventRecord, body || {});

    setResponseStatus(event, 201);
    return {
      success: true,
      message: "Konfirmasi kehadiran tercatat.",
      registrationId: visitor.registrationId,
    };
  } catch (error: unknown) {
    // #region agent log
    if (error instanceof VisitorValidationError) {
      fetch('http://127.0.0.1:7366/ingest/b4c9394e-995b-4ebb-be2d-e3f30facecf0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a40deb'},body:JSON.stringify({sessionId:'a40deb',runId:'pre-fix',hypothesisId:'A',location:'visitor-rsvp.post.ts:validation',message:'Validation failed on visitor-rsvp',data:{errorKeys:Object.keys(error.errors||{}),errors:error.errors},timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion
    if (
      error instanceof VisitorValidationError ||
      error instanceof VisitorConflictError
    ) {
      const mapped = visitorHttpError(error);
      if (mapped) throw createError(mapped);
    }
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan server.",
      data: {
        success: false,
        message: "Terjadi kesalahan server.",
      },
    });
  }
});
