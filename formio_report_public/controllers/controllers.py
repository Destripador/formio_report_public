from odoo.addons.formio.controllers.public import FormioPublicController  # Import the class
import base64
import io
from odoo import http, api, fields, models, _
import logging
_logger = logging.getLogger(__name__)


class FormioPublicController(FormioPublicController):  # Inherit in your custom class
    _inherit = 'formio.form'

    @http.route('/formio/public/form/<string:uuid>/generate', auth='public', type='json')
    def generate_pdf(self, uuid, **kwargs):
        records = http.request.env['formio.form'].sudo().search([("uuid", "=", uuid)], limit=1)

        reports_print_wizard = records.builder_id.public_builder_id
        file = self._generate_qweb_report(reports_print_wizard, records.id)

        return file

    def _generate_qweb_report(self, wizardsq, id):
        def close_streams(streams):
            for stream in streams:
                try:
                    stream.close()
                except Exception:
                    pass


        IrReport = http.request.env['ir.actions.report']

        streams = []
        report_names = []

        report = wizardsq

        content, report_type = report._render([id])

        if report_type == 'pdf':
            pdf_content_stream = io.BytesIO(content)
            streams.append(pdf_content_stream)
            report_names.append(wizardsq.name)

        if streams:
            result = IrReport._merge_pdfs(streams)
            close_streams(streams)
            vals = {'datas': base64.b64encode(result)}
            return vals
        else:
            return "The report could not be generated. It is recommended to check the server log."
