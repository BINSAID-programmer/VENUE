import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 9: Networks, the internet and the web (from Digital Foundations by Binsaid). */
export const CB_CH9: LearnLesson[] = [
  T('net-network', 'Computer networks', 'Mtandao wa kompyuta ni vifaa vilivyounganishwa vinavyoshiriki taarifa, na router ndiyo inayounganisha vifaa vyako na intaneti.',
    'Draw your home or campus network: list each device, the router, and how each one connects (Wi-Fi, cable or mobile data).',
    [
      { h: 'What is a network?', p: [
        'A computer network is a group of connected devices that can communicate and share information or resources. A home Wi-Fi network may connect a laptop, a smartphone, a printer and a router. A university network may connect thousands of computers across many buildings.',
        'Networks let people share files, share one printer, share an internet connection and communicate in many ways.'] },
      { h: 'The main parts of a network', p: [
        'Most networks, big or small, are built from the same few parts.'],
        table: { head: ['Part', 'What it does'], rows: [
          ['Device', 'Any laptop, phone, tablet, printer or other equipment that connects to the network.'],
          ['Router', 'A small box that directs traffic between your devices and the internet. Most routers also provide Wi-Fi.'],
          ['Modem', 'A device that connects the router to the line of your internet provider. Many routers contain a modem.'],
          ['Internet Service Provider (ISP)', 'The company that supplies your connection to the internet. Mobile network operators do this for mobile data.'],
          ['Cable or Wi-Fi', 'The link between devices. A cable is fast and stable; Wi-Fi is convenient but depends on signal strength.'],
        ] } },
      { h: 'Ways of connecting', p: [
        'There are four common ways to get a device online. Choose the one that fits your situation and watch out for its weak point.'],
        table: { head: ['Connection', 'How it works', 'Good for', 'Watch out for'], rows: [
          ['Wi-Fi', 'Radio signals to a router.', 'Laptops and phones at home or on campus.', 'Weak signal far from the router; unsafe if the network is open.'],
          ['Mobile data', 'Your phone connects through a mobile network.', 'Using the internet anywhere there is signal.', 'Data bundles run out; video uses a lot.'],
          ['Mobile hotspot', 'Your phone shares its data with your laptop.', 'Working when there is no Wi-Fi.', 'Uses your data bundle and drains the phone battery.'],
          ['Cable (Ethernet)', 'A cable from the router to the computer.', 'Stable and fast connections.', 'Needs a port and a cable.'],
        ] },
        tip: 'If your laptop has no Wi-Fi nearby, switch on your phone hotspot, but remember it uses your data bundle.' },
    ],
    {
      mistakes: [
        'Thinking the router and the internet are the same thing. The router only directs traffic; the provider supplies the connection.',
        'Forgetting that many routers already contain a modem.',
        'Using a hotspot for large downloads and finishing the data bundle.',
        'Assuming Wi-Fi is always safe. An open network is not.',
      ],
      exercises: [
        { q: 'What is a router and what does it do?', a: 'A router is a small box that directs traffic between your devices and the internet, and most routers also provide Wi-Fi.' },
        { q: 'Name the main parts of a home network.', a: 'Devices, a router, a modem (often inside the router), an internet service provider, and the link: cable or Wi-Fi.' },
        { q: 'When would you use a mobile hotspot, and what is the cost?', a: 'When there is no Wi-Fi and you need your laptop online. It uses your data bundle and drains the phone battery.' },
      ],
      quiz: [
        { q: 'What does a computer network let devices do?', options: ['Only print', 'Communicate and share information or resources', 'Run without power', 'Remove viruses'], answer: 1, why: 'A network is a group of connected devices that can communicate and share information or resources.' },
        { q: 'Which device directs traffic between your devices and the internet?', options: ['Monitor', 'Router', 'Scanner', 'Speaker'], answer: 1, why: 'The router directs traffic, and most routers also provide Wi-Fi.' },
        { q: 'Which connection is usually stable and fast but needs a cable?', options: ['Mobile hotspot', 'Wi-Fi', 'Ethernet', 'Bluetooth speaker'], answer: 2, why: 'A cable (Ethernet) from the router to the computer is stable and fast.' },
        { q: 'Who supplies your connection to the internet?', options: ['Your browser', 'Your Internet Service Provider', 'Your printer', 'Your keyboard'], answer: 1, why: 'The ISP is the company that supplies your connection to the internet; mobile operators do this for mobile data.' },
      ],
    }),

  T('net-internet', 'The internet and the web', 'Intaneti ni mtandao wa dunia nzima wa mitandao; wavuti ni huduma moja tu inayotumia intaneti, kama barua pepe na simu za video ni huduma nyingine.',
    'Write three differences between the internet and the web in your own words, and list two services that use the internet but are not part of the web.',
    [
      { h: 'What is the internet?', p: [
        'The internet is a worldwide system of interconnected computer networks. It lets computers and other devices exchange information using agreed technical rules. It supports many services, including the World Wide Web, email, messaging, video calls, file transfer and online gaming.',
        'Nobody owns the whole internet. It is a global collection of networks run by many organisations that agree to connect to each other.'] },
      { h: 'How information travels', p: [
        'When you send a file or load a page, the information is broken into thousands of small pieces called packets. Each packet carries a label showing where it came from and where it is going.',
        'The packets travel across many connected networks, perhaps by different routes, and are put back together at the other end. This design makes the network resilient: if one route is blocked, packets use another.'] },
      { h: 'IP addresses and domain names', p: [
        'Every device connected to the internet has a number that identifies it, called an IP address, for example 192.0.2.45. Numbers are difficult for people to remember, so websites also have names, such as example.com.',
        'A system called the Domain Name System (DNS) works like a phone book: it converts the name you type into the number that computers need. Note that this is simplified: real communication passes through many routers, networks and servers, but the key idea is that a device sends a request and receives information in response.'] },
      { h: 'The internet is not the web', p: [
        'People often use "internet" and "web" as if they meant the same thing. They do not. The internet is the underlying global network. The World Wide Web is a system of linked pages and resources accessed over the internet using a web browser.',
        'Email, messaging apps and video calls are other services that use the internet but are not part of the web. Think of the internet as the road network and the web as one kind of vehicle travelling on it.'],
        table: { head: ['Term', 'Meaning', 'Example'], rows: [
          ['Internet', 'Global network infrastructure connecting networks and devices.', 'Your laptop connects through Wi-Fi to online services.'],
          ['World Wide Web', 'Linked pages and resources accessed over the internet.', 'A university website or an online article.'],
          ['Website', 'A collection of related web pages and resources.', 'A university\'s official website.'],
          ['Web page', 'One page or resource viewed in a browser.', 'A page showing admission requirements.'],
          ['URL', 'The address used to locate a web resource.', 'https://www.example.com/page'],
          ['Browser', 'Software used to access and display web pages.', 'Chrome, Edge or Firefox.'],
        ] } },
    ],
    {
      mistakes: [
        'Saying "internet" and "web" mean exactly the same thing.',
        'Believing one company owns the internet. It is a collection of networks run by many organisations.',
        'Thinking that data travels as one big file. It is split into packets that may use different routes.',
        'Mixing up a website with a web page. A website is a collection; a page is one item.',
      ],
      exercises: [
        { q: 'Explain the difference between the internet and the World Wide Web.', a: 'The internet is the global network of networks. The web is one service, a system of linked pages viewed with a browser, that runs on the internet.' },
        { q: 'What are packets and why do they make the internet resilient?', a: 'Packets are small pieces of information with a label for source and destination. They can take different routes, so if one route is blocked, others are used.' },
        { q: 'What does DNS do?', a: 'The Domain Name System works like a phone book: it converts the name you type, such as example.com, into the IP address computers need.' },
      ],
      quiz: [
        { q: 'Which of these is NOT part of the web but uses the internet?', options: ['A university web page', 'Email', 'An online article', 'A website'], answer: 1, why: 'Email is a service that uses the internet but is not part of the web.' },
        { q: 'What is an IP address?', options: ['A type of browser', 'A number that identifies a device on the internet', 'A kind of email', 'A password'], answer: 1, why: 'Every connected device has a number that identifies it, for example 192.0.2.45.' },
        { q: 'Information sent across the internet is broken into small pieces called what?', options: ['Packets', 'Cookies', 'Tabs', 'Bookmarks'], answer: 0, why: 'Files and pages are broken into thousands of small packets.' },
        { q: 'In the road comparison, what is the web?', options: ['The whole road network', 'One kind of vehicle on the roads', 'A traffic light', 'The driver'], answer: 1, why: 'The internet is the road network; the web is one kind of vehicle travelling on it, alongside email and video calls.' },
        { q: 'Who owns the whole internet?', options: ['Google', 'Microsoft', 'Nobody; it is a collection of many networks', 'Your ISP'], answer: 2, why: 'It is a global collection of networks run by many organisations that agree to connect.' },
      ],
    }),

  T('net-url', 'Web addresses and how a page loads', 'URL ina sehemu tatu (itifaki, jina la kikoa, njia), na ukifungua ukurasa kuna hatua tano kutoka kuandika anwani hadi kuuona ukurasa.',
    'Copy a web address from your browser into a document. Underline the protocol, the domain name and the path in different colours.',
    [
      { h: 'Reading a URL', p: [
        'A URL (Uniform Resource Locator) is the address of a page or file on the web. It looks long, but it follows a pattern. Learning to read it is one of the most useful safety skills, because criminals often hide behind confusing addresses.'],
        table: { head: ['Part', 'Example', 'Meaning'], rows: [
          ['Protocol', 'https://', 'The rules the browser uses. https means the connection is encrypted (scrambled) so others cannot easily read it. A padlock is shown in the address bar.'],
          ['Domain name', 'www.example.com', 'The name of the website. This part tells you who owns the site.'],
          ['Path', '/courses/intro.html', 'Which page or file inside the website.'],
        ] } },
      { h: 'Domain endings', p: [
        'The last part of a domain name, called the top-level domain, often hints at what kind of organisation owns it. This is only a clue, not proof.'],
        table: { head: ['Ending', 'Usually used for', 'Example idea'], rows: [
          ['.com', 'Commercial businesses (and many others)', 'A company shop'],
          ['.org', 'Organisations and charities', 'A non-profit group'],
          ['.edu or .ac.xx', 'Educational institutions', '.ac.tz for academic institutions in Tanzania'],
          ['.gov or .go.xx', 'Government bodies', '.go.tz for the Tanzanian government'],
          ['.co.xx', 'Commercial organisations in a country', '.co.tz in Tanzania'],
        ] },
        tip: 'The padlock and https show that the connection is encrypted, not that the website is honest. Criminals can also obtain https certificates. Always check the domain name itself.' },
      { h: 'What happens when you open a web page?', p: [
        'When you type an address and press Enter, a surprising amount happens in a second or two. A web server is simply a computer, usually in a large data centre, that stores websites and answers requests 24 hours a day.'],
        steps: [
          'You type an address or click a link. The browser needs to know where to look.',
          'The browser sends a request. It asks the Domain Name System for the IP address of the site, then sends a request to that address.',
          'The network carries the request through your router, your provider and several other networks to the web server that holds the website.',
          'The server sends the page data back. It sends text, pictures, styles and instructions as packets.',
          'The browser builds and shows the page. It puts the pieces together and displays them on your screen.',
        ] },
    ],
    {
      mistakes: [
        'Trusting a site just because it shows a padlock. The padlock only means the connection is encrypted.',
        'Looking at the whole address instead of checking the domain name, which tells you who owns the site.',
        'Treating a domain ending such as .org as proof of honesty. It is only a clue.',
        'Thinking a page appears instantly from nowhere. A request travels to a web server and packets come back.',
      ],
      exercises: [
        { q: 'Describe the parts of the URL https://www.example.com/courses/intro.html.', a: 'The protocol is https://, the domain name is www.example.com, and the path is /courses/intro.html.' },
        { q: 'What does https tell you, and what does it not tell you?', a: 'It tells you the connection is encrypted so others cannot easily read it. It does not tell you the website is honest.' },
        { q: 'List the five steps that happen when you open a web page.', a: 'You type or click, the browser sends a request using DNS, the network carries it to the web server, the server sends the page data back, and the browser builds and shows the page.' },
        { q: 'What does the ending .ac.tz suggest?', a: 'An academic institution in Tanzania, though this is only a clue, not proof.' },
      ],
      quiz: [
        { q: 'The domain name in https://www.example.com/page is...', options: ['https', 'www.example.com', '/page', 'None of these'], answer: 1, why: 'The domain name is the name of the website and tells who owns the site.' },
        { q: 'What does the path /courses/intro.html identify?', options: ['The owner of the site', 'The connection rules', 'Which page or file inside the website', 'The IP address'], answer: 2, why: 'The path says which page or file inside the website you want.' },
        { q: 'What does a padlock in the address bar prove?', options: ['The site is honest', 'The connection is encrypted', 'The site has no viruses', 'The site is government-owned'], answer: 1, why: 'Padlock and https mean the connection is encrypted, not that the site can be trusted.' },
        { q: 'What is a web server?', options: ['A browser tab', 'A computer that stores websites and answers requests', 'A kind of cable', 'A search word'], answer: 1, why: 'A web server is usually in a data centre and answers requests 24 hours a day.' },
        { q: 'Which step comes right after the browser sends a request?', options: ['The network carries the request to the web server', 'The browser shows the page', 'You press Enter', 'The packets are deleted'], answer: 0, why: 'After the request is sent, it travels through your router and other networks to the server that holds the site.' },
      ],
    }),

  T('net-browser', 'Using a web browser', 'Kivinjari ni programu ya kufungua tovuti; tumia tabo, alama na njia za mkato, na kumbuka hali ya faragha haikufanyi usijulikane mtandaoni.',
    'Follow the browsing steps: open a trusted site, open a second tab with Ctrl + T, bookmark a page with Ctrl + D, and open your downloads with Ctrl + J.',
    [
      { h: 'The browser and its parts', p: [
        'A web browser is an application that lets you open websites, view pages, follow links, download files and use web applications. Common browsers include Google Chrome, Microsoft Edge, Mozilla Firefox, Safari and Opera. Browsers differ in appearance and extra features, but they all work in the same way.',
        'A browser is not a search engine. Chrome is a browser. Google Search is a search engine. A person can use Chrome to open Bing, or use another browser to open Google Search.'],
        table: { head: ['Feature', 'Purpose'], rows: [
          ['Address bar', 'Shows the current web address and accepts both addresses and search words.'],
          ['Tabs', 'Let you keep several pages open in one window.'],
          ['Back and Forward', 'Move through the pages you have visited in the current tab.'],
          ['Refresh / Reload', 'Requests the current page again.'],
          ['Bookmarks / Favourites', 'Save links so you can return to them easily.'],
          ['Downloads', 'Shows files you have downloaded through the browser.'],
          ['History', 'A list of pages you have visited.'],
          ['Private browsing', 'Does not save your history on that device afterwards. It does not make you anonymous online.'],
        ] } },
      { h: 'Browse with confidence', p: [
        'Practise these steps with a website you trust, such as a university\'s official site.'],
        steps: [
          'Open your browser from the taskbar or Start menu.',
          'Click the address bar (or press Ctrl + L) and type the address of a website you trust. Press Enter.',
          'Click a link to move to another page. Use the Back arrow (or Alt + Left arrow) to return.',
          'Open a second page in a new tab: press Ctrl + T, type an address, and press Enter. Switch tabs by clicking them or pressing Ctrl + Tab.',
          'Close a tab you no longer need with Ctrl + W. If you closed one by mistake, press Ctrl + Shift + T to bring it back.',
          'To save a useful page, press Ctrl + D and click Done. Find it later in the bookmarks bar or bookmarks menu.',
          'To see what you have downloaded, press Ctrl + J (in Chrome and Edge). The files are usually in the Downloads folder.',
        ] },
      { h: 'History, cookies and privacy', p: [
        'Your browser keeps a history of the pages you visit, and websites may store small files called cookies to remember you or to track what you do. Cookies can be helpful (they keep you signed in or remember a shopping basket) but can also be used to follow you across sites.',
        'On a shared or public computer, use a private window (Ctrl + Shift + N in Chrome, Ctrl + Shift + P in Edge) or clear your history and sign out when you finish.'] },
      { h: 'Extensions and updates', p: [
        'Extensions add features to a browser, but each one can see what you do. Install only a few from the browser\'s official store, read reviews, and remove any you do not use.',
        'Keep your browser updated. It usually updates itself, and restarting it applies the update.'] },
    ],
    {
      mistakes: [
        'Saying "Chrome is a search engine". Chrome is a browser; Google Search is a search engine.',
        'Believing private browsing makes you anonymous. It only avoids saving history on that device.',
        'Installing many extensions from unknown sources. Each one can see what you do.',
        'Leaving yourself signed in on a public computer.',
      ],
      exercises: [
        { q: 'Name five features of a browser window and say what each does.', a: 'Address bar (shows address, accepts search words), tabs (several pages in one window), Back/Forward (move through visited pages), Refresh (request the page again), bookmarks (save links).' },
        { q: 'Which shortcuts open a new tab, close a tab, and reopen a closed tab?', a: 'Ctrl + T opens a new tab, Ctrl + W closes one, and Ctrl + Shift + T brings back a closed tab.' },
        { q: 'What are cookies and why can they be a privacy concern?', a: 'Cookies are small files websites store to remember you or track what you do. They are helpful for staying signed in but can follow you across sites.' },
      ],
      quiz: [
        { q: 'Which statement is correct?', options: ['Chrome is a search engine', 'Google Search is an operating system', 'Chrome is a browser', 'Internet and web mean exactly the same thing'], answer: 2, why: 'Chrome is a browser; Google Search is a search engine.' },
        { q: 'Private browsing...', options: ['Makes you anonymous', 'Reduces local history storage but does not make you anonymous', 'Blocks all viruses', 'Removes the internet'], answer: 1, why: 'It does not save your history on that device afterwards, but it does not make you anonymous online.' },
        { q: 'Which shortcut saves a page as a bookmark?', options: ['Ctrl + D', 'Ctrl + W', 'Ctrl + J', 'Ctrl + L'], answer: 0, why: 'Ctrl + D bookmarks the page; Ctrl + J shows downloads.' },
        { q: 'What does the Refresh button do?', options: ['Deletes the page', 'Requests the current page again', 'Opens a new tab', 'Saves your history'], answer: 1, why: 'Refresh or Reload asks for the current page again.' },
        { q: 'What is a good practice for extensions?', options: ['Install as many as possible', 'Install a few from the official store and remove unused ones', 'Download them from any link', 'Never update the browser'], answer: 1, why: 'Each extension can see what you do, so keep few, trusted ones.' },
      ],
    }),

  T('net-wifi', 'Connecting to Wi-Fi safely', 'Unganisha Wi-Fi sahihi, chukulia Wi-Fi ya umma kuwa si ya faragha, na kama intaneti haifanyi kazi, kagua hatua moja moja.',
    'Open Settings, Network & internet on Windows. Note the name of the network you use and whether you are on Wi-Fi. Then list four public Wi-Fi safety rules.',
    [
      { h: 'Connect to a Wi-Fi network', p: [
        'Connecting is easy, but the care you take at step 3 matters. Criminals sometimes create networks with names that look similar to real ones.'],
        steps: [
          'Click the network icon (a Wi-Fi symbol) in the notification area at the right of the taskbar.',
          'Click the arrow beside Wi-Fi to see the available networks.',
          'Choose the name of the network you want. Make sure it is really the right one.',
          'Click Connect and enter the password if asked. Ask the owner if you do not know it.',
          'Wait for the word Connected. Open a web page to test.',
        ] },
      { h: 'Public Wi-Fi: rules of safe use', p: [
        'Treat public Wi-Fi as less private: other people on the same network may be able to see some of your activity. Do not enter bank details, passwords or other sensitive information on a public network unless you are on a site with https and you trust it.',
        'Prefer your phone\'s mobile data for important tasks. Turn off automatic connection to open networks, and forget the network afterwards (Settings, Network & internet, Wi-Fi, Manage known networks). Confirm the correct network name with the staff of the cafe, library or school.'] },
      { h: 'The internet is not working', p: [
        'Work through the checks in order. Each one narrows down where the problem is.'],
        steps: [
          'Check that Wi-Fi is turned on. The network icon should not have a cross or a plane symbol; if Airplane mode is on, turn it off.',
          'Check whether other devices, such as your phone, are connected to the same Wi-Fi. If they cannot connect either, the problem is the router or the provider.',
          'Switch Wi-Fi off and on, or restart the laptop.',
          'If the problem remains for all devices, switch the router off, wait 30 seconds, and switch it on again. Wait a few minutes.',
          'If it still does not work, contact the provider.',
        ] },
      { h: 'Save your data', p: [
        'If you pay for data bundles, turn off automatic video play and large automatic downloads, and download big files over Wi-Fi where possible.'],
        tip: 'Check Settings, Network & internet, Data usage to see which programs use the most data.' },
    ],
    {
      mistakes: [
        'Connecting to a network with a similar name without checking it is the real one.',
        'Typing bank details or passwords on open public Wi-Fi.',
        'Leaving automatic connection to open networks switched on.',
        'Forgetting to check Airplane mode when Wi-Fi seems dead.',
      ],
      exercises: [
        { q: 'Give four rules for using public Wi-Fi safely.', a: 'Treat it as less private, avoid entering sensitive information unless on a trusted https site, prefer mobile data for important tasks, turn off auto-connect and forget the network afterwards, and confirm the network name with staff.' },
        { q: 'Your laptop has no internet. What is the first thing to check, and what does it tell you if your phone also fails?', a: 'Check that Wi-Fi is on and Airplane mode is off. If your phone also cannot connect, the problem is the router or the provider.' },
        { q: 'How can you reduce data-bundle use?', a: 'Turn off automatic video play and large automatic downloads, download big files over Wi-Fi, and check Data usage in Settings.' },
      ],
      quiz: [
        { q: 'Why check the Wi-Fi name carefully?', options: ['Names do not matter', 'Criminals sometimes create networks with similar names', 'Long names are faster', 'It saves battery'], answer: 1, why: 'Fake networks with look-alike names can be used to watch your activity.' },
        { q: 'Which is better for an important task when away from home?', options: ['Any open Wi-Fi', 'Your phone\'s mobile data', 'A stranger\'s hotspot', 'No security at all'], answer: 1, why: 'Public Wi-Fi is less private, so mobile data is preferred for important tasks.' },
        { q: 'All devices lose internet. After restarting Wi-Fi fails, what do you try?', options: ['Switch the router off for 30 seconds and on again', 'Delete Windows', 'Buy a new laptop', 'Uninstall the browser'], answer: 0, why: 'If the problem affects all devices, restart the router, wait a few minutes, then contact the provider if needed.' },
        { q: 'What does Airplane mode do to Wi-Fi?', options: ['Makes it faster', 'It can switch it off, so turn it off', 'Encrypts the network', 'Nothing'], answer: 1, why: 'If Airplane mode is on, wireless connections are off; turn it off to reconnect.' },
      ],
    }),

  T('net-email-cloud', 'Email and cloud storage', 'Barua pepe nzuri ina somo, salamu, ombi wazi na kufunga kwa heshima; hifadhi ya wingu huweka faili zako mtandaoni ili uzifikie kutoka kifaa chochote.',
    'Write a short professional email to a teacher requesting an extension. Include a subject, a greeting, a clear request and a polite closing.',
    [
      { h: 'The parts of an email', p: [
        'Every email has the same basic parts. Knowing them helps you write clearly and avoid embarrassing mistakes, such as showing a long list of addresses to everyone.'],
        table: { head: ['Part', 'Purpose'], rows: [
          ['To', 'The main recipient or recipients.'],
          ['Cc (carbon copy)', 'Other people who should see the message. Everyone can see who is copied.'],
          ['Bcc (blind carbon copy)', 'People who receive a copy without the others seeing their address. Useful for large groups.'],
          ['Subject', 'A short, clear title. A good subject helps the reader and avoids being ignored.'],
          ['Body', 'The message itself.'],
          ['Attachment', 'A file sent with the message. Check the size and the type before sending or opening.'],
        ] } },
      { h: 'Writing a professional email', p: [
        'An email to a teacher, a manager or an organisation should be polite, clear and short. A model: Subject "Request for extension - Computing Assignment 2". Greeting "Dear Mr Hassan". Then say what you need: a two-day extension on an assignment due Friday, give a short reason, and offer a new date, such as Sunday evening. Close with "Thank you for your consideration. Yours sincerely" and your name and student number.',
        'Use a sensible email address; amina.said@mail.example is better than coolgirl123@mail.example for formal messages. Read the message again before pressing Send, checking names, dates and attachments.'] },
      { h: 'Cloud storage', p: [
        'Cloud storage keeps your files on servers on the internet. Examples include OneDrive and Google Drive. To use one, you sign in with an account; you can then upload files, create folders, share files with others and open your files from any device.',
        'Advantages: access from anywhere, protection if your laptop is lost, and easy sharing. Disadvantages: you need an internet connection for some tasks, storage is limited on free plans, and your account must be protected.'] },
      { h: 'Practical lab: browser and network practice', p: [
        'Goal: practise browsing skills and read web addresses carefully. You have succeeded when you can read each part of a URL and explain the difference between the internet and the web.'],
        steps: [
          'Open your browser. Identify the address bar, tabs, Back, Forward and Refresh. Write the name of your browser.',
          'Open a new tab and go to the official website of a recognised university or educational organisation. Write its domain name and say what its ending suggests.',
          'Open a second website in a new tab (for example Khan Academy). Switch between tabs with Ctrl + Tab.',
          'Bookmark one useful educational page with Ctrl + D. Open the bookmarks list and find it.',
          'Copy a web address from the address bar and paste it into a document. Underline the protocol, the domain name and the path in different colours.',
          'Open Settings, Network & internet in Windows. Note the name of the network you are using and whether you are on Wi-Fi.',
          'Write three differences between the internet and the web in your own words.',
        ] },
    ],
    {
      mistakes: [
        'Leaving the subject line empty or vague so the email is ignored.',
        'Putting a large group in Cc, which shows everyone\'s address. Use Bcc for large groups.',
        'Using an unprofessional email address for formal messages.',
        'Sending without rereading names, dates and attachments.',
      ],
      exercises: [
        { q: 'What do Cc and Bcc mean in an email?', a: 'Cc (carbon copy) sends a copy to others and everyone can see who is copied. Bcc (blind carbon copy) sends a copy without the others seeing the address.' },
        { q: 'List two advantages and two disadvantages of cloud storage.', a: 'Advantages: access from anywhere, protection if a laptop is lost, easy sharing. Disadvantages: needs internet for some tasks, limited free storage, account must be protected.' },
        { q: 'What should a good formal email contain?', a: 'A meaningful subject, a greeting, a clear request, a polite closing, a sensible sender address, and a re-read before sending.' },
      ],
      quiz: [
        { q: 'Which field hides the other recipients\' addresses?', options: ['To', 'Cc', 'Bcc', 'Subject'], answer: 2, why: 'Bcc sends a copy without the others seeing the address, which is useful for large groups.' },
        { q: 'Which is an example of cloud storage?', options: ['A printer', 'OneDrive or Google Drive', 'A router', 'A keyboard'], answer: 1, why: 'OneDrive and Google Drive keep your files on servers on the internet.' },
        { q: 'A device that connects your devices to the internet and often provides Wi-Fi is a...', options: ['Printer', 'Router', 'Monitor', 'Scanner'], answer: 1, why: 'The router directs traffic and usually gives Wi-Fi.' },
        { q: 'Which is a disadvantage of cloud storage?', options: ['Access from any device', 'Easy sharing', 'Some tasks need an internet connection', 'Protection if a laptop is lost'], answer: 2, why: 'You need an internet connection for some tasks; free plans also have limited space.' },
      ],
    }),
];
