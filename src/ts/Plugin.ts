///<reference path='IPlayerAnalyticsObserver.ts'/>
///<reference path='ILoadingTimeObserver.ts'/>
///<reference path='PlayerAnalyticsObserver.ts'/>
///<reference path='LoadingTimeObserver.ts'/>
///<reference path='AnalyticsWrapper.ts'/>
///<reference path='../definitions/JQuery.d.ts'/>
///<reference path='../../bower_components/videojs-plugin-components/vjsplugincomponents.d.ts'/>

module GoogleAnalytics {
    export class Plugin {
        _player: VjsPluginComponents.IPlayer;

        constructor(player) {
            this._player = new VjsPluginComponents.Player(player);
        }

        enable() {
            var applyServiceToPlayer = VjsPluginComponents.ApplySingleService(this._player);

            var durationEmitter = applyServiceToPlayer("DurationSetEmitter")(() => {
                return new VjsPluginComponents.DurationSetEmitter(this._player);
            });

            var singlePointEventRepository = applyServiceToPlayer("SinglePointEventRepository")(() => {
                return new VjsPluginComponents.SinglePointEventRepository(new VjsPluginComponents.ObservableRepository(new VjsPluginComponents.Observable()));
            });

            var timeBasedEventRepository = applyServiceToPlayer("TimeBasedEventRepository")(() => {
                return new VjsPluginComponents.TimeBasedEventRepository(new VjsPluginComponents.ObservableRepository(new VjsPluginComponents.Observable()), singlePointEventRepository);
            });

            var eventManager = applyServiceToPlayer("TimeBasedEventManager")(() => {
                var singlePointEventList = new VjsPluginComponents.WalkableList(VjsPluginComponents.EventSortingFunction,
                    (a) => {
                        return (typeof a.maxCallCount === "undefined") || a.maxCallCount > a.callCount
                    },
                    singlePointEventRepository
                );

                return new VjsPluginComponents.TimeBasedEventManager(new VjsPluginComponents.PlayObserver(this._player), singlePointEventList, timeBasedEventRepository)
            });

            var singlePointEventSubRepository = new VjsPluginComponents.ObservableSubRepository(singlePointEventRepository, new VjsPluginComponents.Observable());

            var loadingObserver = applyServiceToPlayer("LoadingTimeObserver")(() => {
                return new LoadingTimeObserver(this._player, new VjsPluginComponents.Timer(window, new VjsPluginComponents.DateService()));
            });

            var playerAnalyticsObserver = applyServiceToPlayer("PlayerAnalyticsObserver")(() => {
                return new PlayerAnalyticsObserver(this._player, new AnalyticsWrapper(), loadingObserver, singlePointEventSubRepository);
            });
        }
    }
}