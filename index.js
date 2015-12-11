/* jshint node: true */
'use strict';

var path             = require('path');
var Promise          = require('ember-cli/lib/ext/promise');
var DeployPluginBase = require('ember-cli-deploy-plugin');
var Ssh              = require('./lib/ssh');

module.exports = {
  name: 'ember-cli-deploy-ssh-index',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        allowOverwrite: false,
        filePattern: 'index.html',
        port: 22,
        agent: null,
        passphrase: null,
        distDir: function(context) {
          return context.distDir;
        },
        revisionKey: function(context) {
          var revisionKey = context.revisionData && context.revisionData.revisionKey;
          return context.commandOptions.revision || revisionKey;
        }
      },

      requiredConfig: ['username', 'host', 'port', 'remoteDir', 'privateKeyFile'],

      upload: function(context) {
        var allowOverwrite = this.readConfig('allowOverwrite');
        var filePattern    = this.readConfig('filePattern');
        var distDir        = this.readConfig('distDir');
        var revisionKey    = this.readConfig('revisionKey');
        var username       = this.readConfig('username');
        var host           = this.readConfig('host');
        var port           = this.readConfig('port');
        var remoteDir      = this.readConfig('remoteDir');
        var privateKeyFile = this.readConfig('privateKeyFile');

        var options = {
          allowOverwrite: allowOverwrite,
          filePattern: filePattern,
          distDir: distDir,
          revisionKey: revisionKey,
          username: username,
          host: host,
          port: port,
          remoteDir: remoteDir,
          privateKeyFile: privateKeyFile
        };

        this.log('Preparing to upload revision to remote host: `' +
          username + '@' + host + ':' + port + '/' + remoteDir + '`',
          { verbose: true });

        var ssh = new Ssh({ plugin: this });
        return ssh.upload(options);
      },

      activate: function(context) {

      },

      fetchRevisions: function(context) {
        var filePattern    = this.readConfig('filePattern');
        var username       = this.readConfig('username');
        var host           = this.readConfig('host');
        var port           = this.readConfig('port');
        var remoteDir      = this.readConfig('remoteDir');
        var privateKeyFile = this.readConfig('privateKeyFile');

        var options = {
          filePattern: filePattern,
          username: username,
          host: host,
          port: port,
          remoteDir: remoteDir,
          privateKeyFile: privateKeyFile
        };

        var ssh = new Ssh({ plugin: this });
        return ssh.fetchRevisions(options).then(function(revisions) {
          if (revisions && revisions.length) {
            context.revisions = revisions;
          }
        });
      }
    });

    return new DeployPlugin();
  }
};
