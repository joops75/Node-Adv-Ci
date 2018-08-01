const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,// can set to false in dev mode so chrome browser appears during tests
            args: ['--no-sandbox']// Travis setting to speed up process
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {// 'target' refers to 'customPage'
                return customPage[property] || browser[property] ||  page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);
        // set the cookies on the page with 'sign in' values
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        // reload the page so it updates as if signed in
        await this.page.goto('http://localhost:3000/blogs');// Travis requires 'http://' prepended to address
        // wait for desired element to be rendered
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;