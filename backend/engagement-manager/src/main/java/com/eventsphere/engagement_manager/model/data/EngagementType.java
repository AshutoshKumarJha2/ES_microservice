package com.eventsphere.engagement_manager.model.data;

/**
 * EngagementType enum
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
public enum EngagementType {

    // Pre-Event
    REGISTRATION,
    REGISTRATION_CONFIRMATION,
    CHECK_IN,
    SESSION_BOOKMARK,

    // Live Event - Sessions
    SESSION_JOIN,
    SESSION_LEAVE,
    SESSION_QA_SUBMIT,
    SESSION_FEEDBACK_SUBMIT,

    // Live Event - Polls & Surveys
    POLL_VIEW,
    POLL_VOTE,
    SURVEY_SUBMIT,

    // Live Event - Networking
    CHAT_MESSAGE,
    DIRECT_MESSAGE,

    // Expo & Booth Engagement
    BOOTH_VISIT,
    RESOURCE_DOWNLOAD,
    CTA_BUTTON_CLICK,

    // Post-Event
    EVENT_FEEDBACK_SUBMIT,
    CERTIFICATE_DOWNLOAD,
    RECORDING_PLAY
}
