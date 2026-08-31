<?php
/**
 * Callback request handler (task #123yxuagbee).
 *
 * POST target of the /contact/ form. Validates, filters spam without a
 * CAPTCHA (honeypot + minimum fill time), routes the lead by time of day
 * (Europe/Dublin), and redirects back to /contact/ with a status flag that
 * tracking.js turns into a visible message and a GA4 event.
 *
 * Routing config: defaults below reach the firm's monitored inbox even when
 * unconfigured, so a lead is never dropped. Create lead-config.php next to
 * this file on the server (copy lead-config.sample.php) to route to the
 * on-call rota once Art supplies the addresses.
 *
 * Deliberately NOT collected: email address, allegation detail. The lead is
 * a name and a phone number; everything else is optional. Do not log message
 * content server-side.
 */

declare(strict_types=1);

$config = [
    // In-hours recipient (office).
    'to_office'      => 'info@ferrysolicitors.com',
    // Out-of-hours recipients (on-call rota). Same inbox until the rota
    // addresses are supplied; out-of-hours mail is additionally flagged
    // URGENT in the subject line.
    'to_out_of_hours' => ['info@ferrysolicitors.com'],
    // Envelope/From mailbox. Must exist on the sending domain or SPF/DMARC
    // will junk these. Set the real one in lead-config.php at deploy time.
    'from'           => 'no-reply@' . preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['SERVER_NAME'] ?? 'gardastationsolicitors.example'),
    // Office hours, Europe/Dublin.
    'hours_start'    => '09:00',
    'hours_end'      => '17:30',
    'redirect'       => '/contact/',
];
if (is_file(__DIR__ . '/lead-config.php')) {
    $config = array_merge($config, require __DIR__ . '/lead-config.php');
}

function redirect_status(string $base, string $key, string $val): never
{
    header('Location: ' . $base . '?' . $key . '=' . rawurlencode($val) . '#callback', true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . $config['redirect'], true, 303);
    exit;
}

/** Single-line field: trim, collapse whitespace, strip anything header-like. */
function field(string $name, int $max): string
{
    $v = (string)($_POST[$name] ?? '');
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);
    $v = trim(preg_replace('/\s+/', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
}

$name    = field('name', 120);
$phone   = field('phone', 30);
$station = field('station', 120);
$message = trim(str_replace("\0", '', mb_substr((string)($_POST['message'] ?? ''), 0, 2000)));

// Spam checks: fail SILENTLY (pretend success) so bots learn nothing, and a
// false positive never shows a distressed person an error.
$honeypot = (string)($_POST['website'] ?? '');
$ts       = (string)($_POST['ts'] ?? '');
$tooFast  = $ts !== '' && ctype_digit($ts) && ((int)(microtime(true) * 1000) - (int)$ts) < 4000;
if ($honeypot !== '' || $tooFast) {
    redirect_status($config['redirect'], 'sent', '1');
}

if ($name === '' || $phone === '' || !preg_match('/^[0-9 +().\-]{6,30}$/', $phone)) {
    redirect_status($config['redirect'], 'err', 'missing');
}

$now = new DateTimeImmutable('now', new DateTimeZone('Europe/Dublin'));
$dow = (int)$now->format('N'); // 1 Mon .. 7 Sun
$hm  = $now->format('H:i');
$inHours = $dow <= 5 && $hm >= $config['hours_start'] && $hm < $config['hours_end'];

$recipients = $inHours ? [$config['to_office']] : $config['to_out_of_hours'];
$subject = ($inHours ? '' : 'URGENT out of hours - ') . 'Callback request - Garda Station Solicitors';

$lines = [
    'Callback request from the Garda Station Solicitors website.',
    '',
    'Name:          ' . $name,
    'Phone:         ' . $phone,
    'Garda station: ' . ($station !== '' ? $station : '(not given)'),
    '',
    'Message:',
    $message !== '' ? $message : '(none)',
    '',
    'Submitted:     ' . $now->format('D d M Y H:i') . ' (Irish time)' . ($inHours ? '' : ' - OUT OF HOURS'),
    '',
    'Ring the person back as soon as possible. If they are in a Garda station',
    'the detention clock is running.',
];
$body = implode("\n", $lines);

$headers = [
    'From: Garda Station Solicitors <' . $config['from'] . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];

$ok = mail(implode(', ', $recipients), $subject, $body, implode("\r\n", $headers));

if (!$ok) {
    error_log('lead.php: mail() failed for callback request at ' . $now->format('c'));
    redirect_status($config['redirect'], 'err', 'send');
}

redirect_status($config['redirect'], 'sent', '1');
