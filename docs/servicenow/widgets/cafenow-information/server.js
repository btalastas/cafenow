(function () {
    var section = String($sp.getParameter('section') || '');
    data.expandedSection = /^(about|team|nutrition)$/.test(section) ? section : '';
})();
