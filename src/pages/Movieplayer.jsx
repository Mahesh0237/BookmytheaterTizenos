import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import {
  Play,
  Pause,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Settings,
  X,
  Volume2,
  VolumeOff,
  MinusIcon,
  PlusIcon,
} from "lucide-react";

import Movieapi from "../components/api/Movieapi";
import Moviestatapi from "../components/api/Moviestatapi";

export default function Movieplayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const playerState = location.state || {};

  const type = playerState.type || "Movie";
  const movieUuid = playerState.movie_uuid || null;
  const userUid = playerState.user_uid || null;
  const userId = playerState.user_id || null;
  const referenceUid = playerState.referenceUid || null;
  const languageId = playerState.language_Id || null;
  const initialWatchTime = playerState.movieWatchTime || 0;
  const initialVideoUrl = playerState.videoUrl || null;

  useEffect(() => {
    if (!initialVideoUrl) navigate(-1);
  }, [initialVideoUrl, navigate]);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeout = useRef(null);
  const currentTimeRef = useRef(initialWatchTime || 0);
  const resumeTimeRef = useRef(initialWatchTime || 0);
  const lastVolume = useRef(1);

  const [paused, setPaused] = useState(true); // Start paused until metadata
  const [currentTime, setCurrentTime] = useState(initialWatchTime || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [resolutions, setResolutions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedLanguageId, setSelectedLanguageId] = useState(
    languageId ? String(languageId) : "1"
  );
  const [videoSource, setVideoSource] = useState(initialVideoUrl);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  // D-Pad Navigation State
  const [activeControlSection, setActiveControlSection] = useState('CENTER'); // TOP, CENTER, BOTTOM, SETTINGS
  const [focusedControlIndex, setFocusedControlIndex] = useState(1); // Default to Play/Pause
  const [settingsFocus, setSettingsFocus] = useState({ section: 'AUDIO', index: 0 }); // section: AUDIO/QUALITY/CLOSE

  const controlRefs = { top: useRef([]), center: useRef([]), bottom: useRef([]) };
  const settingsRefs = { audio: useRef([]), quality: useRef([]), close: useRef(null) };

  // Reset controls visibility timer
  const resetControlsTimer = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Sync initial watch time
  useEffect(() => {
    currentTimeRef.current = initialWatchTime || 0;
    resumeTimeRef.current = initialWatchTime || 0;
    setCurrentTime(initialWatchTime || 0);
  }, [initialWatchTime]);

  // Load resolution & language options
  useEffect(() => {
    const loadOptions = async () => {
      if (type !== "Movie" || !movieUuid || !userUid) {
        setResolutions(["720p"]);
        setLanguages([{ id: "1", name: "Default" }]);
        setSelectedResolution("720p");
        setSelectedLanguageId(languageId ? String(languageId) : "1");
        return;
      }
      try {
        const response = await Movieapi.get(
          `${movieUuid}/${userUid}/resolutionsandlanguages`
        );
        const data = response.data;
        const fetchedResolutions = data.resolutions?.length
          ? data.resolutions
          : ["720p"];
        const fetchedLanguages = data.languages?.length
          ? data.languages
          : [{ id: "1", name: "Default" }];

        setResolutions(fetchedResolutions);
        setLanguages(fetchedLanguages);

        if (data.userPreferences) {
          setSelectedResolution(data.userPreferences.resolution || "720p");
          const prefLang =
            data.userPreferences.languageId ||
            languageId ||
            fetchedLanguages[0]?.id ||
            "1";
          setSelectedLanguageId(String(prefLang));
        } else {
          setSelectedResolution("720p");
          const fallback = languageId || fetchedLanguages[0]?.id || "1";
          setSelectedLanguageId(String(fallback));
        }
      } catch (error) {
        console.error("Failed to load options:", error);
        setResolutions(["720p"]);
        setLanguages([{ id: "1", name: "Default" }]);
        setSelectedResolution("720p");
        setSelectedLanguageId(languageId ? String(languageId) : "1");
      }
    };
    loadOptions();
  }, [type, movieUuid, userUid, languageId]);

  // Save user preferences
  const savePreferences = async (resolution, langId) => {
    if (!movieUuid || !userUid) return;
    try {
      await Movieapi.post(`savemoviepreferences`, {
        movie_uuid: movieUuid,
        resolution,
        languageId: langId,
        user_uuid: userUid,
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  // Load video source (HLS or direct)
  const loadVideo = (url) => {
    const video = videoRef.current;
    if (!video || !url) return;

    setErrorMessage("");
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && url.includes(".m3u8")) {
      const hls = new Hls({
        enableWorker: true,
        debug: false,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setErrorMessage("");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Fatal Error:", data);
          setErrorMessage("Failed to load video stream. Please try again.");
        }
      });
    } else {
      video.src = url;
      video.load();
    }
  };

  useEffect(() => {
    if (videoSource) {
      loadVideo(videoSource);
    }
  }, [videoSource]);

  // Change resolution/language with auto-play & resume
  const changeVideoSource = async (resolution, langId) => {
    if (type !== "Movie" || !movieUuid || !userUid) return;

    setIsSourceLoading(true);
    const wasPlaying = !paused;
    const previousSource = videoSource;
    const resumeTime = currentTimeRef.current || 0;
    wasPlayingAfterSourceChange.current = wasPlaying;

    try {
      const resp = await Movieapi.get(
        `${movieUuid}/videourl?resolution=${resolution}&languageId=${langId}`
      );
      const data = resp.data;

      if (!data.videoUrl) {
        setErrorMessage("No video URL found.");
        setIsSourceLoading(false);
        return;
      }

      await savePreferences(resolution, langId);

      // Save resume time
      resumeTimeRef.current = resumeTime;

      // Close settings
      setSettingsVisible(false);

      // Pause and switch
      setPaused(true);
      setVideoSource(null);

      setTimeout(() => {
        setVideoSource(data.videoUrl);
        setSelectedResolution(resolution);
        setSelectedLanguageId(String(langId));
        setIsSourceLoading(false);

        // Auto-play after short delay
        setTimeout(() => {
          setPaused(false);
        }, 400);
      }, 100);
    } catch (error) {
      console.error("Source change failed:", error);
      setErrorMessage("Failed to switch. Reverting...");
      setVideoSource(previousSource);
      setTimeout(() => setErrorMessage(""), 2000);
    } finally {
      setIsSourceLoading(false);
    }
  };

  // On metadata loaded → seek + auto-play
  const onLoadedMetadata = () => {
    const vid = videoRef.current;
    if (!vid) return;

    setDuration(vid.duration || 0);

    const seekTime = resumeTimeRef.current;
    if (seekTime > 0 && seekTime < (vid.duration || Infinity)) {
      vid.currentTime = seekTime;
      currentTimeRef.current = seekTime;
      setCurrentTime(seekTime);
    }

    // Auto-play on first load OR after source change
    if (!autoplayAttempted || wasPlayingAfterSourceChange) {
      vid.play().catch(() => {
        console.log("Autoplay prevented by browser.");
        setPaused(true);
      });
      setPaused(false);
      setAutoplayAttempted(true);
    }
  };
  const wasPlayingAfterSourceChange = useRef(false);

  // Time update
  const onTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    resetControlsTimer();
    const time = vid.currentTime;
    currentTimeRef.current = time;
    setCurrentTime(time);
  };

  // Seek
  const handleSeek = (time) => {
    const vid = videoRef.current;
    if (!vid) return;
    const clamped = Math.min(Math.max(time, 0), duration || 0);
    vid.currentTime = clamped;
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);
    resumeTimeRef.current = clamped;
  };

  const skip = (sec) => handleSeek((currentTime || 0) + sec);

  // Play/Pause/Mute/Volume
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (paused) {
      vid.play().catch(() => { });
      setPaused(false);
    } else {
      vid.pause();
      setPaused(true);
    }
  };

  // Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (volume === 0) {
      const restored = lastVolume.current || 1;
      setVolume(restored);
      video.volume = restored;
    } else {
      lastVolume.current = volume;
      setVolume(0);
      video.volume = 0;
    }
  };

  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (videoRef.current) videoRef.current.volume = clampedVolume;
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Click screen to toggle controls
  const handleScreenClick = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    } else {
      setShowControls(true);
      resetControlsTimer();
    }
  };

  // Back button
  const handleBack = () => {
    const watchTime = Math.floor(currentTimeRef.current || 0);
    if (referenceUid) {
      Moviestatapi.post("/addwatchtime", {
        reference_uid: referenceUid,
        watch_time: watchTime,
        videotype: type,
      }).catch(() => { });
    }
    if (userId && movieUuid) {
      Moviestatapi.post("/addwatchhistory", {
        user_id: userId,
        movie_uid: movieUuid,
        video_type: type,
        watch_time: watchTime,
      }).catch(() => { });
    }
    navigate(-1);
  };

  // Save watch history every 15s
  useEffect(() => {
    if (!movieUuid || !userId) return;
    const interval = setInterval(() => {
      if (currentTimeRef.current > 0) {
        Moviestatapi.post("/addwatchhistory", {
          user_id: userId,
          movie_uid: movieUuid,
          video_type: type,
          watch_time: Math.floor(currentTimeRef.current),
        }).catch(() => { });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [movieUuid, userId, type]);

  // --- D-Pad Navigation Logic ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showControls) {
        // If controls are hidden, any key press should show them and do nothing else.
        resetControlsTimer();
        e.preventDefault();
        return;
      }

      e.preventDefault();

      if (settingsVisible) {
        // --- Settings Panel Navigation ---
        const { section, index } = settingsFocus;
        if (e.key === 'ArrowUp') {
          if (section === 'QUALITY') setSettingsFocus({ section: 'AUDIO', index: 0 });
          else if (section === 'AUDIO') setSettingsFocus({ section: 'CLOSE', index: 0 });
        } else if (e.key === 'ArrowDown') {
          if (section === 'CLOSE') setSettingsFocus({ section: 'AUDIO', index: 0 });
          else if (section === 'AUDIO') setSettingsFocus({ section: 'QUALITY', index: 0 });
        } else if (e.key === 'ArrowLeft') {
          if (section === 'QUALITY' && index === 0) {
            setSettingsFocus({ section: 'AUDIO', index: languages.length - 1 });
          } else if (section !== 'CLOSE') {
            setSettingsFocus(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }));
          }
        } else if (e.key === 'ArrowRight') {
          if (section === 'AUDIO' && index === languages.length - 1) {
            setSettingsFocus({ section: 'QUALITY', index: 0 });
          } else if (section === 'AUDIO') {
            setSettingsFocus(prev => ({ ...prev, index: prev.index + 1 }));
          } else if (section === 'QUALITY') {
            setSettingsFocus(prev => ({ ...prev, index: Math.min(resolutions.length - 1, prev.index + 1) }));
          }
        } else if (e.key === 'Enter') {
          if (section === 'CLOSE') settingsRefs.close.current?.click();
          if (section === 'AUDIO') settingsRefs.audio.current[index]?.click();
          if (section === 'QUALITY') settingsRefs.quality.current[index]?.click();
        } else if (e.key === 'Backspace' || e.key === 'Escape') {
          setSettingsVisible(false);
        }
        return;
      }

      // --- Main Controls Navigation ---
      switch (activeControlSection) {
        case 'TOP':
          if (e.key === 'ArrowDown') {
            setActiveControlSection('CENTER');
            setFocusedControlIndex(1);
          } else if (e.key === 'Enter') {
            controlRefs.top.current[0]?.click();
          }
          break;

        case 'CENTER':
          if (e.key === 'ArrowUp') {
            setActiveControlSection('TOP');
            setFocusedControlIndex(0);
          } else if (e.key === 'ArrowDown') {
            setActiveControlSection('BOTTOM');
            setFocusedControlIndex(0); // Focus on seek bar first
          } else if (e.key === 'ArrowLeft') {
            setFocusedControlIndex(prev => Math.max(0, prev - 1));
          } else if (e.key === 'ArrowRight') {
            setFocusedControlIndex(prev => Math.min(2, prev + 1));
          } else if (e.key === 'Enter') {
            controlRefs.center.current[focusedControlIndex]?.click();
          }
          break;

        case 'BOTTOM':
          if (e.key === 'ArrowUp') {
            setActiveControlSection('CENTER');
            setFocusedControlIndex(1);
          } else if (e.key === 'ArrowLeft') {
            if (focusedControlIndex === 0) {
              skip(-10);
            } else {
              setFocusedControlIndex(prev => prev - 1);
            }
          } else if (e.key === 'ArrowRight') {
            if (focusedControlIndex === 0) {
              skip(10);
            } else {
              const maxIndex = type === "Movie" ? 4 : 3;
              setFocusedControlIndex(prev => Math.min(maxIndex, prev + 1));
            }
          } else if (e.key === 'ArrowDown') {
            if (focusedControlIndex === 0) { // From seek bar to volume
              setFocusedControlIndex(1);
            } else if (focusedControlIndex === 1) { // On volume button, decrease volume
              handleVolumeChange(volume - 0.1);
            }
          } else if (e.key === 'ArrowUp') {
            if (focusedControlIndex === 1) { // On volume button, increase volume
              handleVolumeChange(volume + 0.1);
            } else { // From any other button (including seek bar), go up to center controls
              setActiveControlSection('CENTER');
              setFocusedControlIndex(1);
            }
          } else if (e.key === 'Enter') {
            const targetControl = controlRefs.bottom.current[focusedControlIndex];
            if (targetControl) {
              // For the seek bar and volume slider, 'Enter' does nothing.
              // For other buttons, it triggers a click.
              if (focusedControlIndex > 0) { // Only for actual buttons
                targetControl.click();
              }
            }
          }
          break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showControls, settingsVisible, activeControlSection, focusedControlIndex, settingsFocus, languages, resolutions, skip, volume]);

  // Effect to scroll focused elements into view
  useEffect(() => {
    if (settingsVisible) {
      const { section, index } = settingsFocus;
      let el;
      if (section === 'CLOSE') el = settingsRefs.close.current;
      else if (section === 'AUDIO') el = settingsRefs.audio.current[index];
      else if (section === 'QUALITY') el = settingsRefs.quality.current[index];
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [settingsVisible, settingsFocus]);

  if (!initialVideoUrl) return null;

  return (
    <div
      className="w-full h-screen bg-black relative overflow-hidden"
      onMouseMove={resetControlsTimer}
      onClick={(e) => e.target === e.currentTarget && handleScreenClick()}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => {
          setPaused(true);
          setCurrentTime(0);
          currentTimeRef.current = 0;
          resumeTimeRef.current = 0;
        }}
        controls={false}
        playsInline
        autoPlay={false} // Controlled manually
      />

      {/* Click overlay */}
      <div className="absolute inset-0" onClick={handleScreenClick} />

      {/* Loading */}
      {isSourceLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-white flex flex-col items-center">
            <div className="w-12 h-12 border-t-4 border-red-600 rounded-full animate-spin mb-3" />
            <span>Switching quality...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <>
          <div className="absolute top-4 left-4 right-4 flex justify-between text-white z-30">
            <button
              ref={el => controlRefs.top.current[0] = el}
              className={`p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition ${activeControlSection === 'TOP' ? 'ring-4 ring-[#c02628]' : ''}`}
              onClick={handleBack}
            >
              <ArrowLeft size={32} />
            </button>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-10 z-30">
            <button
              ref={el => controlRefs.center.current[0] = el}
              className={`p-4 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-transform ${activeControlSection === 'CENTER' && focusedControlIndex === 0 ? 'scale-110 ring-4 ring-[#c02628]' : ''}`}
              onClick={() => skip(-10)}
            >
              <RotateCcw color="white" size={32} />
            </button>

            <button
              ref={el => controlRefs.center.current[1] = el}
              className={`p-3 bg-red-600 rounded-full hover:bg-red-700 transition shadow-lg ${activeControlSection === 'CENTER' && focusedControlIndex === 1 ? 'scale-110 ring-4 ring-white' : ''}`}
              onClick={togglePlay}
            >
              {paused ? <Play color="white" size={40} /> : <Pause color="white" size={40} />}
            </button>

            <button
              ref={el => controlRefs.center.current[2] = el}
              className={`p-4 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-transform ${activeControlSection === 'CENTER' && focusedControlIndex === 2 ? 'scale-110 ring-4 ring-[#c02628]' : ''}`}
              onClick={() => skip(10)}
            >
              <RotateCw color="white" size={32} />
            </button>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 text-white z-30">
            <div className="w-full justify-between flex items-center gap-2 px-6">
              <span className="text-xl font-medium w-12 text-center">{formatTime(currentTime)}</span>
              <input
                ref={el => controlRefs.bottom.current[0] = el}
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className={`flex-1 h-1 accent-red-600 cursor-pointer rounded-full ${activeControlSection === 'BOTTOM' && focusedControlIndex === 0 ? 'ring-2 ring-white' : ''}`}
                style={{ background: `linear-gradient(to right, #c02628 ${(currentTime / duration) * 100 || 0}%, #374151 ${(currentTime / duration) * 100 || 0}%)` }}
              />
              <span className="text-xl font-medium w-12 text-center">{formatTime(duration)}</span>
            </div>
            <div className="w-full flex justify-between items-center gap-4 px-6">
              <div className="flex items-center gap-3">
                {/* Volume Down */}
                <button
                  ref={el => controlRefs.bottom.current[1] = el}
                  className={`p-2 text-2xl rounded-full ${activeControlSection === 'BOTTOM' && focusedControlIndex === 1 ? 'ring-4 ring-[#c02628]' : ''}`}
                  onClick={() => handleVolumeChange(volume - 0.1)}>
                  <MinusIcon color="white" size={32} />
                </button>

                {/* Mute/Unmute */}
                <button
                  ref={el => controlRefs.bottom.current[2] = el}
                  className={`p-2 rounded-full ${activeControlSection === 'BOTTOM' && focusedControlIndex === 2 ? 'ring-4 ring-[#c02628]' : ''}`} onClick={toggleMute}>
                  {volume > 0 ? <Volume2 color="white" size={32} /> : <VolumeOff color="white" size={32} />}
                </button>

                {/* Volume Up */}
                <button
                  ref={el => controlRefs.bottom.current[3] = el}
                  className={`p-2 text-2xl rounded-full ${activeControlSection === 'BOTTOM' && focusedControlIndex === 3 ? 'ring-4 ring-[#c02628]' : ''}`}
                  onClick={() => handleVolumeChange(volume + 0.1)}>
                  <PlusIcon color="white" size={32} />
                </button>
              </div>

              {type === "Movie" && (
                <button
                  ref={el => controlRefs.bottom.current[4] = el}
                  className={`p-2 rounded-full ${activeControlSection === 'BOTTOM' && focusedControlIndex === 4 ? 'ring-4 ring-[#c02628]' : ''}`}
                  onClick={() => setSettingsVisible(true)}
                >
                  <Settings color="white" size={32} />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {settingsVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-2xl flex gap-8 relative">
            <button
              ref={settingsRefs.close}
              className={`absolute top-3 right-3 p-1 hover:bg-gray-800 rounded ${settingsFocus.section === 'CLOSE' ? 'ring-4 ring-[#c02628]' : ''}`}
              onClick={() => setSettingsVisible(false)}
            >
              <X color="#e50914" size={24} />
            </button>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Audio</h3>
              <div className="flex gap-2 flex-wrap">
                {languages.map((item, index) => (
                  <button
                    ref={el => (settingsRefs.audio.current[index] = el)}
                    key={item.id}
                    className={`px-4 py-2 rounded transition-all duration-200 ${settingsFocus.section === 'AUDIO' && settingsFocus.index === index
                      ? "bg-red-600 text-white scale-110 ring-4 ring-white"
                      : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    onClick={() => changeVideoSource(selectedResolution, item.id)}
                    disabled={isSourceLoading}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Quality</h3>
              <div className="flex gap-2 flex-wrap">
                {resolutions.map((item, index) => (
                  <button
                    ref={el => (settingsRefs.quality.current[index] = el)}
                    key={item}
                    className={`px-4 py-2 rounded transition-all duration-200 ${settingsFocus.section === 'QUALITY' && settingsFocus.index === index
                      ? "bg-red-600 text-white scale-110 ring-4 ring-white"
                      : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    onClick={() => changeVideoSource(item, selectedLanguageId)}
                    disabled={isSourceLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {errorMessage}
        </div>
      )}
    </div>
  );
}