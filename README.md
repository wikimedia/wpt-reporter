# wpt-reporter

Collect browser metrics using WebPageTest and choose how to report it. We wrap the functionality of the https://github.com/marcelduran/webpagetest-api and collect the most important metrics from the (giant) result JSON and report it as/to CSV/JSON/Graphite/statsv.

## Install

<pre>
npm install wpt-reporter
</pre>

## Run
To be able to use it you need to either have an API key to the public WebPageTest instance (you can get one [here](http://www.webpagetest.org/getkey.php)) or setup your own instance (follow our instructions [here](https://wikitech.wikimedia.org/wiki/WebPageTest#WebPageTest_and_AWS) on how to setup your own instance at AWS).

When you have the key or your own instance and cloned/installed this repository, you are ready to go.

You can check all configuration with help:
<pre>
wpt-reporter --help
</pre>

All parameters will also be passed on to the  [webpagetest-api](https://github.com/marcelduran/webpagetest-api) so if you want to configure a specific WebPageTest configuration that isn't included in the help section, check out the [runTest](https://github.com/marcelduran/webpagetest-api#test-works-for-runtest-method-only) method and add that to the parameter list.

## Choose server and location
When you run a test you need configure which WebPageTest server to use (default one is http://www.webpagetest.org) and a location (for WebPageTest.org it uses *Dulles:Chrome* but you can change that to one of the available in http://www.webpagetest.org/getLocations.php).

If you run your own WebPageTest server make sure to also change the location. You change server and location with the parameters *webPageTestHost* and *location*.

## The keys/name of the metrics
If you send the data to Graphite/statsv, the key names will be generated like this:
*namespace.location.browser.view.metric*

Lets go through it:
 * **namespace** is the start of the key default is webpagetest but you can change that with the parameter *--namespace* when you run the script.
 * **location** is the location of your agent, this will be picked up automatically from your configuration.
 * **browser** is the browser type in WebPageTest. If we emulate a mobile browser, the name will have *-emaulatedMobile* appended to the name. If the name isn't configured in WebPageTest, the full location string is used.
 * **view** is the *firstView* or *repeatView*.
 * **metrics** is the actual metric that's picked up

A key look something like this **webpagetest.us-west-1.chrome.firstView.SpeedIndex**

 Note: If you test your pages with different connectivities or in other ways want to sepaprate the keys, just add an part of your key with the namespace like: *--namespace webpagetest.cable*

## Choose what metrics to collect
Default these metrics are collected:
 * [SpeedIndex](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index)
 * [render](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics#TOC-Start-Render)
 * [TTFB](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics#TOC-First-Byte)
 * [fullyLoaded](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics)
 * The size and number of request for html, js, css and images

You can override the timing metrics by supplying the **--metrics** parameter with a comma separated list of metrics to collect. They will be fetched from the median run from the JSON namespace of data.median.firstView.METRIC and data.median.repeatView.METRIC.

## How report the metrics
You can choose how to report the metrics collected by setting the **reporter**.

### CSV
Why should you use CSV? It's nice in way if you want to test a couple URLs and compare the result. You can choose where CSV data will be stored with the **file** option. If the file doesn't exist, it will add one line with all the column names of the metrics. If the file exists, it will just append the new metrics on a new line.

<pre>
wpt-reporter --reporter csv --file myruns.csv --webPageTestKey MY_SECRET_KEY https://www.wikipedia.org/
</pre>

### JSON
The JSON reporter is a nice way to just check metrics for a run. Use it like this:

<pre>
wpt-reporter --reporter json --webPageTestKey MY_SECRET_KEY https://www.wikipedia.org/
</pre>

### Graphite
Do you want to graph your data? Do that by storing the metrics in Graphite. To do that you need to have Graphite up and running (hint: use a Docker container including Graphite, that's much easier than installing it yourself).

When you run you add your configuration to the Graphite host and port:

<pre>
wpt-reporter --reporter graphite --graphiteHost graphite.example.org --graphitePort 2003 --webPageTestKey MY_SECRET_KEY https://www.wikipedia.org/
</pre>

### statsv
[Statsv](https://wikitech.wikimedia.org/wiki/Graphite#statsv) what we use at Wikimedia to get metrics to Graphite, via statsd, over HTTP. You can [read more](https://wikitech.wikimedia.org/wiki/WebPageTest) about how we use it together with WebPageTest.

## Environment variables and scripting
If you feed the script with a batch file containing multiple runs or if you use [WebPageTest script language](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting), keys will automatically be replaced with environment variables. The keys need to be of the format *<%KEY_NAME>*.

If we have the variable <%WMF_WPT_KEY> in our script, it will be replaced by the environment variable named WMF_WPT_KEY. Running in node, the value will be replaced with *process.env.WMF_WPT_KEY*. If the environment variable is missing from the file, you will notice that in the console log.

How can you use that? One example is that you can make generic login script and parametrize the URL you want to test like this:

<pre>
// The login page
logData 0
navigate https://en.m.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page

// Log in the user
setValue        name=wpName     <%WPT_USER>
setValue        name=wpPassword <%WPT_USER_PASSWORD>
submitForm      name=userlogin

// This is the URL that we want to measure as a logged in user
logData 1
navigate <%WPT_MOBILE_URL>
</pre>
Here you set the login name (<%WPT_USER>) the password <%WPT_USER_PASSWORD> and the URL to test (<%WPT_MOBILE_URL>) as variables.


## Want to know more?

You can find more info about how we use WebPageTest at [Wikitech](https://wikitech.wikimedia.org/wiki/WebPageTest).


This is a Github mirror of "performance/WebPageTest" - our actual code is hosted with Gerrit (please see https://www.mediawiki.org/wiki/Developer_access for contributing.
