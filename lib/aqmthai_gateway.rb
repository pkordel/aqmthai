class AqmthaiGateway
  attr_reader :browser
  def initialize
    @browser = Selenium::WebDriver.for :phantomjs
  end

  def raw_data(start_date: '2016-02-01', end_date: '2016-02-29')
    browser.get('http://aqmthai.com/public_report.php?lang=en')
    browser.find_element(:name, 'stationId').send_key('36t')
    sleep 2
    browser.find_element(:id, 'parameterSelected').send_key('PM2.5')
    browser.execute_script("document.getElementsByName('startDate')[0]" \
                           ".removeAttribute('disabled')")
    browser.execute_script("document.getElementsByName('endDate')[0]" \
                           ".removeAttribute('disabled')")

    browser.find_element(:name, 'startDate').clear
    browser.find_element(:name, 'startDate').send_keys(start_date)
    browser.find_element(:name, 'endDate').clear
    browser.find_element(:name, 'endDate').send_keys(end_date)

    browser.find_element(:id, 'endHour').send_keys('00')
    browser.find_element(:id, 'endMin').send_keys('00')

    browser.find_element(:name, 'bt_show_table').click
    sleep 2
    result = browser.find_element(:class, 'google-visualization-table-table').text
    browser.quit
    result.split("\n").map(&:strip)
  end
end
