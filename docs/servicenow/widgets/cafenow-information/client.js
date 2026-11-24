api.controller = function ($scope, $location) {
    var c = this;
    function selectSection(section) {
        c.open = {
            about: section === 'about',
            team: section === 'team',
            nutrition: section === 'nutrition'
        };
    }
    selectSection(c.data.expandedSection);
    // React when footer links change only the query on the current About page,
    // including browser Back/Forward, without requiring widget recreation.
    $scope.$watch(function () {
        return $location.search().section || '';
    }, function (section) {
        selectSection(section);
    });
};
