import 'materialize-css';
import $ from 'jquery';

/**
 * Main app code after DomReady event
 */
$(
    () => {
        $('.button-collapse').sideNav();
        console.log('App started');
    }
);
