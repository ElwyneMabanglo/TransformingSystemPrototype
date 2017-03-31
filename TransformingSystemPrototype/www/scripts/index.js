// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.

        if (!localStorage.getItem('titlePage1')) {
            localStorage.setItem('titlePage1', 'Page 1');
        }

        if (!localStorage.getItem('titlePage2')) {
            localStorage.setItem('titlePage2', 'Page 2');
        }

        if (!localStorage.getItem('terms')) {
            localStorage.setItem('terms', 'Terms &amp; Conditions');
        }

        if (!localStorage.getItem('termsText')) {
            localStorage.setItem('termsText', 'test is here is subject to the following terms of use: The content of the pages of this website is for your general information and use only. It is subject to change without notice. This website uses cookies to monitor browsing preferences. If you do allow cookies to be used, the following personal information may be stored by us for use by third parties: [insert list of information]. Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law. Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements. This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions. All trade marks reproduced in this website which are not the property of, or licensed to, the operator are acknowledged on the website. Unauthorised use of this website may give rise to a claim for damages and/or be a criminal offence. From time to time this website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s). Your use of this website and any dispute arising out of such use of the website is subject to the laws of England, Northern Ireland, Scotland and Wales.');
        }

        document.getElementById("titleMain1").innerHTML = document.getElementById("titleSide1").innerHTML = localStorage.getItem('titlePage1');
        document.getElementById("titleMain2").innerHTML = document.getElementById("titleSide2").innerHTML = localStorage.getItem('titlePage2');
        document.getElementById("titleMain3").innerHTML = document.getElementById("titleSide3").innerHTML = localStorage.getItem('terms');
        document.getElementById("termsText").innerHTML = localStorage.getItem('termsText')

        // google-analytics-plugin - https://github.com/danwilson/google-analytics-plugin
        window.ga.startTrackerWithId('UA-91544606-1')
        window.ga.trackView(localStorage.getItem('titlePage1','', true))
        //window.ga.setAllowIDFACollection(true)
        //window.ga.trackTiming('Category', IntervalInMilliseconds, 'Variable', 'Label')

    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        window.ga.trackEvent('Status', 'Application Pause','', true);
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
        window.ga.trackEvent('Status', 'Application Resumed','', true);
    };
} )();