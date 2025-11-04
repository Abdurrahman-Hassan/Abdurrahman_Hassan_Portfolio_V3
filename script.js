document.querySelectorAll(".skill").forEach(e => { e.addEventListener("mousemove", t => { let l = e.parentElement, o = l.querySelector(".follower"), i = l.getBoundingClientRect(), n = t.clientX - i.left, r = t.clientY - i.top; o.style.position = "absolute", o.style.left = `${n}px`, o.style.top = `${r}px` }), e.addEventListener("mouseleave", t => { let l = e.parentElement, o = l.querySelector(".follower"); o.style.position = "absolute", o.style.left = "50%", o.style.top = "50%" }) });


// Supabase Client Initialization
const supabaseUrl = 'https://tdzxsovbjvzqfwxkidgr.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkenhzb3ZianZ6cWZ3eGtpZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzgxMTEsImV4cCI6MjA1MTI1NDExMX0.XNGRJguG_9da4Y1XZ9Jth3g4ZCdS2LSQ75MGBStY1xY'; // Replace with your Supabase anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Track User Data
const trackVisitorData = () => {
    // Referrer Tracking
    const referrer = document.referrer;

    // Device/Browser Information
    const userAgent = navigator.userAgent;
    const isMobile = /mobile/i.test(userAgent);
    const browserName = /Chrome|Firefox|Safari|Edge/i.exec(userAgent)[0];
    const browserVersion = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/)[2];

    // Session Duration
    const sessionStart = Date.now();
    window.onbeforeunload = () => {
        const sessionEnd = Date.now();
        const sessionDuration = sessionEnd - sessionStart; // Duration in ms

        // Scroll Depth
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (scrollHeight - window.innerHeight)) * 100;

        // Time Spent on Specific Elements
        let elementStartTime;
        const element = document.querySelector('.interactive-element');
        let timeSpentOnElement = 0;

        if (element) {
            element.addEventListener('mouseenter', () => {
                elementStartTime = Date.now();
            });
            element.addEventListener('mouseleave', () => {
                timeSpentOnElement = Date.now() - elementStartTime;
            });
        }

        // Click Tracking
        const clicks = [];
        document.querySelectorAll('button, a').forEach(element => {
            element.addEventListener('click', (e) => {
                clicks.push({ tag: e.target.tagName, content: e.target.textContent || e.target.href });
            });
        });

        // Geolocation Tracking
        let geolocation = {};
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                geolocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
            });
        }

        // LocalStorage & Cookies
        const localStorageData = JSON.stringify(localStorage);
        const cookies = document.cookie;

        // Sending Data to Supabase
        sendDataToSupabase({
            referrer,
            userAgent,
            isMobile,
            browserName,
            browserVersion,
            sessionDuration,
            scrollPercentage,
            timeSpentOnElement,
            clicks,
            geolocation,
            localStorageData,
            cookies
        });
    };
};

// Function to Send Data to Supabase
const sendDataToSupabase = async (visitorData) => {
    const { data, error } = await supabase
        .from('users')
        .insert([
            {
                referrer: visitorData.referrer,
                user_agent: visitorData.userAgent,
                is_mobile: visitorData.isMobile,
                browser_name: visitorData.browserName,
                browser_version: visitorData.browserVersion,
                session_duration: visitorData.sessionDuration,
                scroll_depth: visitorData.scrollPercentage,
                time_spent_on_element: visitorData.timeSpentOnElement,
                clicks: JSON.stringify(visitorData.clicks),
                geolocation: visitorData.geolocation ? JSON.stringify(visitorData.geolocation) : null,
                local_storage: visitorData.localStorageData,
                cookies: visitorData.cookies,
                timestamp: new Date().toISOString()
            }
        ]);

    if (error) {
        console.error('Error saving data to Supabase:', error);
    } else {
        console.log('Visitor data successfully saved to Supabase:', data);
    }
};

// Initialize Tracking
window.onload = trackVisitorData;
