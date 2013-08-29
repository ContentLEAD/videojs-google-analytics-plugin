///<reference path='Plugin.ts'/>
///<reference path='../../../definitions/VideoJS.d.ts'/>

_V_.plugin("googleAnalyticsPlugin", function (options) {
    var plugin = new GoogleAnalytics.Plugin(this);
    plugin.enable();
});