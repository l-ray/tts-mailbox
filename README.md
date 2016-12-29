Connects sipgate.io and owncloud contacts by delivering a 8bit WAV to be played on an incoming call. This WAV includes the name of the caller.

Environment variables needed:
 * DB_HOST 
 * DB_LOGIN
 * DB_PW
 * DB_NAME
 * WAV_OUTPUT_DIR (default: ~/Aufnahmen/)
 * WAV_INPUT_DIR (default: ~/Aufnahmen/)
 * WAV_INTRO_INPUT (default: "intro.wav")
 * WAV_EXTRO_INPUT (default: "intro.wav")
 * OUTPUT_URL 

Software needed on server
 * espeak
 * ffmpeg
