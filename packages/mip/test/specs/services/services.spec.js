import Services from 'src/services'

describe('services', () => {
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox

  /**
   * @type {sinon.SinonSpy}
   */
  let Constructor

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    Constructor = sinon.spy(class {})
  })

  afterEach(() => sandbox.restore())

  describe('window singletons', () => {
    beforeEach(() => {
      window.services = null
    })

    it('should make per window singletons', () => {
      Services.registerService('a', Constructor)
      const a1 = Services.getService('a')
      Services.registerService('a', Constructor)
      const a2 = Services.getService('a')
      expect(a1).to.equal(a2)
      expect(Constructor).to.be.calledOnce
      expect(Constructor.args[0][0]).to.equal(window)

      Services.registerService('b', Constructor)
      const b1 = Services.getService('b')
      Services.registerService('b', Constructor)
      const b2 = Services.getService('b')
      expect(b1).to.equal(b2)
      expect(b1).to.not.equal(a1)
      expect(Constructor).to.have.callCount(2)
      expect(Constructor.args[1][0]).to.equal(window)
    })

    it('should not instantiate service when registered', () => {
      Services.registerService('a', Constructor)
      expect(Constructor).to.not.be.called
      Services.getService('a')
      expect(Constructor).to.be.calledOnce
    })

    it('should only instantiate the service once', () => {
      Services.registerService('a', Constructor)
      Services.getService('a')
      expect(Constructor).to.be.calledOnce
      Services.getService('a')
      expect(Constructor).to.be.calledOnce
    })

    it('should instantiate service immediately', () => {
      Services.registerService('a', Constructor, true)
      const a = window.services.a
      expect(a.instance).instanceOf(Constructor)
      expect(a.context).to.be.null
      expect(a.Constructor).to.be.null
    })

    it('should return the service when it exists', () => {
      const a0 = Services.getServiceOrNull('a')
      expect(a0).to.be.null
      Services.registerService('a', Constructor)
      const a1 = Services.getService('a')
      const a2 = Services.getServiceOrNull('a')
      expect(a1).to.equal(a2)
      const b0 = Services.getServiceOrNull('b')
      expect(b0).to.be.null
      Services.registerService('b', Constructor)
      const b1 = Services.getServiceOrNull('b')
      expect(b1).instanceOf(Constructor)
    })

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = Services.getServicePromise('a')
      const p2 = Services.getServicePromise('a')
      expect(p1).to.equal(p2)
      Services.registerService('a', Constructor)
      return Promise.all([p1, p2]).then(([a1, a2]) => {
        expect(a1).to.equal(a2)
        expect(Constructor).to.be.calledOnce
      })
    })

    it('should resolve existing service promise on registering service', () => {
      const p = Services.getServicePromise('a')
      Services.registerService('a', Constructor)
      expect(Constructor).to.be.calledOnce
      return p.then((a) => {
        expect(a).instanceOf(Constructor)
        expect(Constructor).to.be.calledOnce
      })
    })

    it('should resolve service promise if service is registered', () => {
      Services.registerService('a', Constructor)
      expect(Constructor).to.not.be.called
      return Services.getServicePromise('a').then((a) => {
        expect(a).instanceOf(Constructor)
        expect(Constructor).to.be.calledOnce
      })
    })

    it('should not return null promise for registered services', () => {
      Services.registerService('a', Constructor)
      const p = Services.getServicePromiseOrNull('a')
      expect(p).to.not.be.null
    })

    it('should set service builders to null after instantiation', () => {
      Services.registerService('a', Constructor)
      expect(window.services.a.instance).to.be.null
      expect(window.services.a.Constructor).to.equal(Constructor)
      Services.getService('a')
      expect(window.services.a.instance).instanceOf(Constructor)
      expect(window.services.a.Constructor).to.be.null
    })
  })
})
