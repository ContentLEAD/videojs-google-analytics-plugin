///<reference path='IPlayerAnalyticsObserver.ts'/>
///<reference path='ILoadingTimeObserver.ts'/>
///<reference path='PlayerAnalyticsObserver.ts'/>
///<reference path='LoadingTimeObserver.ts'/>
///<reference path='AnalyticsWrapper.ts'/>
///<reference path='../../../definitions/JQuery.d.ts'/>
///<reference path='../common/Timer.ts'/>
///<reference path='../common/DateService.ts'/>
///<reference path='../vjsplugin/Player.ts'/>
///<reference path='../vjsplugin/SinglePointEventRepository.ts'/>
///<reference path='../vjsplugin/ApplySingleService.ts'/>
///<reference path='../vjsplugin/Observable.ts'/>
///<reference path='../vjsplugin/ObservableSubRepository.ts'/>
///<reference path='../vjsplugin/ObservableRepository.ts'/>
///<reference path='../vjsplugin/WalkableList.ts'/>
///<reference path='../vjsplugin/EventSortingFunction.ts'/>
///<reference path='../vjsplugin/PlayObserver.ts'/>
///<reference path='../vjsplugin/TimeBasedEventRepository.ts'/>
///<reference path='../vjsplugin/DurationSetEmitter.ts'/>

module GoogleAnalytics {
    export class Plugin {
        _player: VjsPlugin.IPlayer;

        constructor(player) {
            this._player = new VjsPlugin.Player(player);
        }

        enable() {
            var applyServiceToPlayer = VjsPlugin.ApplySingleService(this._player);

            var durationEmitter = applyServiceToPlayer("DurationSetEmitter")(() => {
                return new VjsPlugin.DurationSetEmitter(this._player);
            });

            var singlePointEventRepository = applyServiceToPlayer("SinglePointEventRepository")(() => {
                return new VjsPlugin.SinglePointEventRepository(new VjsPlugin.ObservableRepository(new VjsPlugin.Observable()));
            });

            var timeBasedEventRepository = applyServiceToPlayer("TimeBasedEventRepository")(() => {
                return new VjsPlugin.TimeBasedEventRepository(new VjsPlugin.ObservableRepository(new VjsPlugin.Observable()), singlePointEventRepository);
            });

            var eventManager = applyServiceToPlayer("TimeBasedEventManager")(() => {
                var singlePointEventList = new VjsPlugin.WalkableList(VjsPlugin.EventSortingFunction,
                    (a) => {
                        return (typeof a.maxCallCount === "undefined") || a.maxCallCount > a.callCount
                    },
                    singlePointEventRepository
                );

                return new VjsPlugin.TimeBasedEventManager(new VjsPlugin.PlayObserver(this._player), singlePointEventList, timeBasedEventRepository)
            });

            var singlePointEventSubRepository = new VjsPlugin.ObservableSubRepository(singlePointEventRepository, new VjsPlugin.Observable());

            var loadingObserver = applyServiceToPlayer("LoadingTimeObserver")(() => {
                return new LoadingTimeObserver(this._player, new Common.Timer(window, new Common.DateService()));
            });

            var playerAnalyticsObserver = applyServiceToPlayer("PlayerAnalyticsObserver")(() => {
                return new PlayerAnalyticsObserver(this._player, new AnalyticsWrapper(), loadingObserver, singlePointEventSubRepository);
            });
        }
    }
}