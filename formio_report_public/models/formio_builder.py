# Copyright Nova Code (http://www.novacode.nl)
# See LICENSE file for full licensing details.

from odoo import api, fields, models, _
from odoo.addons.formio.models.formio_builder import Builder as builder
import logging
_logger = logging.getLogger(__name__)


class Builder_public(models.Model):
    _inherit = 'formio.builder'

    public_report = fields.Boolean()
    public_builder_id = fields.Many2one(
        'ir.actions.report', string='Report', tracking=True,
        domain=[('model', '=', 'formio.form')])

    def _get_public_form_js_params(self):
        """ Form: Odoo JS (Owl component) misc. params """
        params = {
            'public_submit_done_url': self.public_submit_done_url,
            'wizard_on_next_page_save_draft': self.wizard and self.wizard_on_next_page_save_draft,
            'submission_url_add_query_params_from': self.submission_url_add_query_params_from,
            'public_report': self.public_report,
        }
        return params
