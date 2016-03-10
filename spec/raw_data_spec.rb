require_relative '../lib/aqicm_gateway'

RSpec.describe AqicmGateway do
  subject { described_class.new }

  describe '.raw_data' do
    it 'is successful' do
      expect(subject.raw_data.first).to eq('Summary 36t_PM2.5 (ug/m3)')
    end
  end
end
