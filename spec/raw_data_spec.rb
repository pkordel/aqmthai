require_relative '../lib/aqmthai_gateway'

RSpec.describe AqmthaiGateway do
  subject { described_class.new }

  describe '.raw_data' do
    it 'is successful' do
      result = subject.raw_data(start_date: '2016-02-01',
                                end_date: '2016-02-29')
      expect(result.first).to eq('Summary 36t_PM2.5 (ug/m3)')
    end
  end
end
