// A simple script to manually trigger the Easter egg animation
// You can paste this in your browser console when viewing your Angular portfolio

(function() {
  const easterEggService = angular.getInjector(['ng']).get('EasterEggService');
  if (easterEggService) {
    console.log('Manually triggering the MY EYES Easter egg animation...');
    easterEggService.triggerLightModeAnimation();
  } else {
    console.log('Could not find the Easter egg service. Make sure it is properly injected.');
  }
})();
