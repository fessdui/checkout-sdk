import $ from 'jquery';

export default function loaded() {
    if ($('#tab-specifications').text().trim() !== '') {
        $('.tab-heading--specs').show();
    }

    // bulk pricing
    $('.productView-info-bulkPricing li').each(function formatRule() {
        const priceRules = $(this).text().trim().replace(/\r?\n|\r/g, '').split(/(.*)(and get | and pay only)/gi);
        const formattedRule = `<strong>${priceRules[1]}</strong>${priceRules[2]}<strong><span>${priceRules[3]}</span></strong>`;
        $(this).html(formattedRule);
    });

    // release date
    if ($('.release-date').length > 0) {
        const date = $('.release-date').text().split(/(Expected release date is)/i);
        $('.release-date').html(`${date[1]} <strong>${date[2]}</strong>`);
    }
}
