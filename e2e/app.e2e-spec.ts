import { PbSpinwheelPage } from './app.po';

describe('pb-spinwheel App', () => {
  let page: PbSpinwheelPage;

  beforeEach(() => {
    page = new PbSpinwheelPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
