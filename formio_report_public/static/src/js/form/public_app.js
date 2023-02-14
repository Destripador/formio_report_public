// Copyright Nova Code (http://www.novacode.nl)
// See LICENSE file for full licensing details.

import { OdooFormioForm } from "/formio/static/src/js/form/formio_form.js";


/**
FIX / WORKAROUND browser compatibility error.
Wrap Component class and bootstrap into functions and put template in
Component env.

OS/platform: browsers
=====================
- Mac: Safari 13.1
- iOS: Safari, Firefox

Error
=====
- Safari 13.1 on Mac experiences error:
  unexpected token '='. expected an opening '(' before a method's parameter list
- iOS not debugged yet. Dev Tools not present in browser.

More info
=========
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Browser_compatibility
*/

function app() {
    class App extends OdooFormioForm {
        initForm() {
            if (!!document.getElementById('formio_form_uuid')) {
                this.formUuid = document.getElementById('formio_form_uuid').value;
            }
            this.configUrl = '/formio/public/form/' + this.formUuid + '/config';
            this.submissionUrl = '/formio/public/form/' + this.formUuid + '/submission';
            this.submitUrl = '/formio/public/form/' + this.formUuid + '/submit';
            this.wizardSubmitUrl = '/formio/public/form/';
            this.apiUrl = '/formio/public/form/' + this.formUuid + '/api';
        }

        publicSubmitDoneUrl() {
            return this.params.hasOwnProperty('public_submit_done_url') && this.params.public_submit_done_url;
        }

        public_report() {
            return this.params.hasOwnProperty('public_report') && this.params.public_report;
        }

        submitDone(submission) {
          if (this.public_report() == true) {
            $.jsonRpc.request('/formio/public/form/'+ this.formUuid +'/generate', 'generate_pdf', {'data': "EMPTY"}, {'async': false})
              .then(function(result) {
                var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
                var URL = 'data:application/pdf;base64,' + result.datas;
                var win = window.open(URL, "_self", strWindowFeatures);
              });
          }

          if (submission.state == 'submitted') {
                if (this.publicSubmitDoneUrl()) {
                    const params = {submit_done_url: this.publicSubmitDoneUrl()};
                    if (window.self !== window.top) {
                        window.parent.postMessage({odooFormioMessage: 'formioSubmitDone', params: params});
                    }
                    else {
                        window.location = params.submit_done_url;
                    }
                }
                else {
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            }
            else {
                setTimeout(function() {
                    window.location.reload();
                }, 1000);
            }

        }
    }

    const app = new App();
    app.mount(document.getElementById('formio_form_app'));
}

async function start() {
    const templates = await owl.utils.loadFile('/formio/static/src/js/form/public_app.xml');
    const env = { qweb: new owl.QWeb({templates})};
    owl.Component.env = env;
    await owl.utils.whenReady();
    app();
}

start();
