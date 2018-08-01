const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('.btn-floating');
    })

    test('Can see a blog form after clicking add button', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using invalid inputs', async () => {
        beforeEach( async () => {
            await page.type('.title input', 'my title');
            await page.type('.content input', 'my content');
            await page.click('.teal');// 'form button' selector fails for some reason
        });

        test('Submitting shows a review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Clicking Save Blog posts entry to /blogs route', async () => {
            await page.click('button.green');
            // only one entry will be present as a new user has been created
            await page.waitFor('.card-title');

            const title = await page.getContentsOf('.card-title');
            const contents = await page.getContentsOf('p');
            expect(title).toEqual('my title');
            expect(contents).toEqual('my content');
        });
    });

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('.teal');// 'form button' selector fails for some reason
        });

        test('The form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('When not logged in', async () => {
    test('User cannot create blog posts', async () => {
        const result = await page.evaluate(
            () => {

                return fetch('/api/blogs', {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ title: 'my title', content: 'my content' }), // body data type must match "Content-Type" header
                }).then(response => response.json())

            }
        );

        expect(result).toEqual({ error: 'You must log in!' });
    });

    test('User cannot view blog posts', async () => {
        const result = await page.evaluate(
            () => {

                return fetch('/api/blogs', {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).then(response => response.json())

            }
        );

        expect(result).toEqual({ error: 'You must log in!' });
    });
});