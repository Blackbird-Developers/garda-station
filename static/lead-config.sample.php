<?php
/**
 * Copy to lead-config.php ON THE SERVER (next to lead.php) and fill in the
 * real routing. lead-config.php is deliberately not in git: it carries the
 * on-call rota addresses.
 *
 * Every key is optional; anything omitted keeps the safe default in lead.php
 * (everything to info@ferrysolicitors.com).
 */
return [
    // Where in-hours leads go (Mon-Fri 09:00-17:30 Irish time).
    'to_office' => 'info@ferrysolicitors.com',

    // Where out-of-hours leads go: the on-call solicitor rota, NOT a shared
    // inbox nobody watches at 3am. Multiple addresses all receive the mail.
    // NEEDED FROM ART / FERRYS before launch.
    'to_out_of_hours' => [
        'info@ferrysolicitors.com',
        // 'oncall@ferrysolicitors.com',
    ],

    // A real mailbox on the sending domain (SPF/DMARC alignment) once the
    // domain is decided, e.g. 'no-reply@gardastationsolicitors.ie'.
    // 'from' => 'no-reply@example.ie',
];
